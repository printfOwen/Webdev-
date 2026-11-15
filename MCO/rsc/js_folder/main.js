(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Header shadow + back-to-top button
  const nav = $(".site-nav"), top = $("#top");
  addEventListener("scroll", () => {
    nav && nav.classList.toggle("scrolled", scrollY > 20);
    top && top.classList.toggle("show", scrollY > 600);
  }, { passive: true });
  top && top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // Fade in sections as you scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  const reveal = root => $$(".reveal:not(.in)", root).forEach((el, i) => {
    el.style.setProperty("--dl", (i % 4) * 0.08 + "s");
    io.observe(el);
  });
  reveal();

  // Cinema schedule (feature page only). Edit the cinemas and times here.
  const list = $("#cinemaList"), days = $("#days"), toast = $("#toast");
  if (list && days) {
    const C = [
      { n: "Vigan Plaza Cinemas", h: "Cinema 2 · Japanese audio, English subs", p: 280, t: [["10:30 AM", "1:45 PM", "5:00 PM", "8:15 PM"], ["11:00 AM", "2:15 PM", "6:30 PM"], ["10:00 AM", "1:15 PM", "4:30 PM", "7:45 PM"]] },
      { n: "Laoag Metro Cinemas", h: "Cinema 4 · English dub", p: 260, t: [["11:00 AM", "2:15 PM", "6:30 PM"], ["12:30 PM", "3:45 PM", "7:00 PM"], ["11:15 AM", "2:30 PM", "5:45 PM", "9:00 PM"]] },
      { n: "Ilocos Grand Cinemas", h: "Cinema 1 · Japanese audio, English subs", p: 300, t: [["12:00 PM", "3:30 PM", "7:00 PM"], ["1:00 PM", "4:15 PM", "7:30 PM"], ["12:15 PM", "3:00 PM", "6:15 PM"]] }
    ];
    let d = 0, timer;
    const label = i => i === 0 ? "Today" : new Date(Date.now() + i * 864e5).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
    const draw = () => {
      days.innerHTML = [0, 1, 2].map(i => `<button class="btn btn-day ${i === d ? "active" : ""}" data-d="${i}">${label(i)}</button>`).join("");
      list.innerHTML = C.map(c => `<div class="col-md-6 col-lg-4"><div class="card h-100 p-3 reveal"><h5><i class="bi bi-geo-alt-fill text-danger"></i> ${c.n}</h5><p class="mb-1 small text-secondary">${c.h}</p><div>${c.t[d].map(t => `<button class="time" data-c="${c.n}">${t}</button>`).join("")}</div><p class="mt-2 mb-0 fw-bold">₱${c.p}</p></div></div>`).join("");
      reveal(list);
    };
    days.addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (b) { d = +b.dataset.d; draw(); } });
    list.addEventListener("click", e => {
      const b = e.target.closest(".time"); if (!b) return;
      $$(".time.picked").forEach(x => x.classList.remove("picked"));
      b.classList.add("picked");
      toast.textContent = `${b.textContent} at ${b.dataset.c}, ${label(d)}`;
      toast.classList.add("show");
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove("show"), 2500);
    });
    draw();
  }
})();