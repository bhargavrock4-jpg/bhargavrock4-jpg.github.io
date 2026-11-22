'use strict';
(() => {
  const chapters = [
    {
      date: 'SEP 2019–AUG 2021', number: '01', label: 'THE FRONT LINE', title: 'Customer Service Associate',
      description: 'The starting point of my Amazon journey: resolving customer issues, learning the operation, and supporting colleagues across teams.',
      points: ['Moved into subject-matter support within two months, as described in my résumé.', 'Supported teams across Bangalore, Hyderabad, and Delhi.', 'Trained new associates and worked through complex customer escalations.'],
      takeaway: 'Listen closely. Understand what matters.'
    },
    {
      date: 'AUG 2021–FEB 2025', number: '02', label: 'FROM CASES TO PATTERNS', title: 'Seller & Brand Support - US',
      description: 'A deeper view of the seller experience: investigating difficult cases, identifying systemic issues, and coordinating improvements beyond an individual interaction.',
      points: ['Analyzed more than 6,000 seller cases to uncover recurring problems.', 'Helped drive a Negative Response Rate improvement program across four teams.', 'Served as a quality auditor for nine months and mentored new associates.'],
      takeaway: 'Solve the case. Then ask why it happened.'
    },
    {
      date: 'FEB–NOV 2025', number: '03', label: 'OWNING THE FOLLOW-THROUGH', title: 'Account Manager',
      description: 'Working with premium sellers on complex issues, with attention to service commitments, coordinated execution, and consistent engagement.',
      points: ['Managed high-impact seller cases and cross-functional escalations.', 'Built tools for SLA tracking and resolution recommendations.', 'Introduced AI-assisted workflows to reduce repetitive manual effort.'],
      takeaway: 'Make the next step clearer, for everyone.'
    },
    {
      date: 'OCT 2025–PRESENT', number: '04', label: 'THE BIGGER PICTURE', title: 'Selling Partner Relations Manager',
      description: 'Connecting analytical insights, operational execution, and relationship management to support key marketplace sellers and long-term partner success.',
      points: ['Manage premium seller portfolios with a focus on performance improvement and growth.', 'Coordinate across teams to resolve high-impact seller issues.', 'Turn recurring challenges into opportunities for more effective processes.'],
      takeaway: 'See the relationship. Understand the system.'
    }
  ];
  const panel = document.querySelector('#chapter-panel');
  document.querySelectorAll('[data-chapter]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') return;
      const chapter = chapters[Number(button.dataset.chapter)];
      document.querySelectorAll('[data-chapter]').forEach(item => {
        const active = item === button;
        item.setAttribute('aria-pressed', String(active));
        item.classList.toggle('active', active);
      });
      document.querySelector('#chapter-date').textContent = chapter.date;
      document.querySelector('#chapter-overline').textContent = `CHAPTER ${chapter.number} / ${chapter.label}`;
      document.querySelector('#chapter-title').textContent = chapter.title;
      document.querySelector('#chapter-description').textContent = chapter.description;
      document.querySelector('#chapter-takeaway').textContent = chapter.takeaway;
      document.querySelector('#chapter-watermark').textContent = chapter.number;
      document.querySelector('#chapter-points').replaceChildren(...chapter.points.map(text => {
        const li = document.createElement('li');
        li.textContent = text;
        return li;
      }));
      panel.classList.remove('changing');
      requestAnimationFrame(() => panel.classList.add('changing'));
    });
  });

  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));
  }

  const canvas = document.querySelector('#sculpture');
  const ctx = canvas.getContext('2d');
  const motionButton = document.querySelector('#motion-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  let paused = reducedMotion.matches;
  let inView = true;
  let raf = 0;
  let lastFrame = 0;
  let angle = 0.18;
  let width = 0, height = 0;
  let pointerX = 0, pointerY = 0;
  let tiltX = 0, tiltY = 0;

  const unit = vector => {
    const length = Math.hypot(...vector) || 1;
    return vector.map(value => value / length);
  };
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const center = t => {
    const r = 1.05 + 0.34 * Math.cos(3*t);
    return [r*Math.cos(2*t), r*Math.sin(2*t), 0.47*Math.sin(3*t)];
  };
  const rings = 156, sides = 16;
  const vertices = [];
  const faces = [];
  for (let i = 0; i < rings; i++) {
    const t = i/rings * Math.PI*2;
    const c = center(t), next = center(t + 0.001);
    const tangent = unit(next.map((value, index) => value - c[index]));
    const normal = unit(cross(tangent, [0,0,1]));
    const binormal = unit(cross(tangent, normal));
    for (let j = 0; j < sides; j++) {
      const a = j/sides * Math.PI*2;
      vertices.push(c.map((value, index) => value + 0.235*(Math.cos(a)*normal[index] + Math.sin(a)*binormal[index])));
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < sides; j++) {
      faces.push([i*sides+j, ((i+1)%rings)*sides+j, ((i+1)%rings)*sides+(j+1)%sides, i*sides+(j+1)%sides]);
    }
  }
  function rotate(p) {
    let [x,y,z] = p;
    const ax = 0.82 + tiltY;
    let yy = y*Math.cos(ax) - z*Math.sin(ax);
    let zz = y*Math.sin(ax) + z*Math.cos(ax);
    const ay = angle + tiltX;
    let xx = x*Math.cos(ay) + zz*Math.sin(ay);
    z = -x*Math.sin(ay) + zz*Math.cos(ay);
    const az = -0.18;
    x = xx*Math.cos(az) - yy*Math.sin(az);
    y = xx*Math.sin(az) + yy*Math.cos(az);
    return [x,y,z];
  }
  function draw() {
    if (!ctx || !width || !height) return;
    ctx.clearRect(0,0,width,height);
    const scale = Math.min(width,height)*0.285;
    const transformed = vertices.map(rotate);
    const projection = transformed.map(([x,y,z]) => {
      const perspective = 6.6/(6.6-z);
      return [width/2+x*scale*perspective, height/2-y*scale*perspective];
    });
    const ordered = faces.map(indices => ({ indices, z: indices.reduce((sum,index) => sum+transformed[index][2],0)/4 })).sort((a,b) => a.z-b.z);
    for (const face of ordered) {
      const [a,b,c] = face.indices.map(index => transformed[index]);
      const n = unit(cross(c.map((v,i) => v-a[i]), b.map((v,i) => v-a[i])));
      const light = Math.max(0,n[0]*-0.38+n[1]*0.58+n[2]*0.72);
      const shade = 0.42 + light*0.69;
      const color = `rgb(${Math.round(176*shade)},${Math.round(73*shade)},${Math.round(39*shade)})`;
      ctx.beginPath();
      face.indices.forEach((index,i) => {
        const point = projection[index];
        if (i === 0) ctx.moveTo(...point); else ctx.lineTo(...point);
      });
      ctx.closePath();
      ctx.fillStyle=color;
      ctx.fill();
      ctx.strokeStyle=color;
      ctx.lineWidth=0.7;
      ctx.stroke();
    }
  }
  function frame(timestamp) {
    raf = 0;
    if (paused || !inView || document.hidden || !ctx) return;
    if (timestamp-lastFrame >= 40) {
      const delta = Math.min(timestamp-lastFrame,80);
      angle += delta*0.000065;
      tiltX += (pointerX-tiltX)*0.05;
      tiltY += (pointerY-tiltY)*0.05;
      draw();
      lastFrame=timestamp;
    }
    raf=requestAnimationFrame(frame);
  }
  function synchronize() {
    paused = userPaused || reducedMotion.matches;
    document.body.classList.toggle('motion-paused',paused);
    motionButton.disabled = reducedMotion.matches;
    motionButton.replaceChildren(document.createTextNode(reducedMotion.matches ? 'Reduced motion on ' : paused ? 'Resume motion ' : 'Pause motion '));
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden','true');
    icon.textContent = paused ? '▷' : 'Ⅱ';
    motionButton.append(icon);
    if (raf) cancelAnimationFrame(raf);
    raf=0;
    lastFrame=0;
    if (!paused && inView && !document.hidden && ctx) raf=requestAnimationFrame(frame);
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width=bounds.width; height=bounds.height;
    const dpr = Math.min(devicePixelRatio || 1,2);
    canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
    if (ctx) ctx.setTransform(dpr,0,0,dpr,0,0);
    draw();
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize',resize);
  canvas.addEventListener('pointermove',event => {
    if (paused || event.pointerType !== 'mouse') return;
    const bounds=canvas.getBoundingClientRect();
    pointerX=((event.clientX-bounds.left)/bounds.width-.5)*.35;
    pointerY=((event.clientY-bounds.top)/bounds.height-.5)*.25;
  });
  canvas.addEventListener('pointerleave',() => { pointerX=pointerY=0; });
  motionButton.addEventListener('click',() => { userPaused=!userPaused; synchronize(); });
  reducedMotion.addEventListener('change',() => { synchronize(); draw(); });
  document.addEventListener('visibilitychange',synchronize);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    inView=entries[0].isIntersecting;
    synchronize();
  },{threshold:0.01}).observe(canvas);
  resize();
  synchronize();
})();
