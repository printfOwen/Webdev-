
(() => {

  // =========================
  // Helper Functions
  // =========================

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];


  // =========================
  // Header Shadow + Back-to-Top Button
  // =========================

  const nav = $(".site-nav");
  const top = $("#top");

  addEventListener("scroll", () => {

    // Add shadow to navbar when scrolling
    nav && nav.classList.toggle("scrolled", scrollY > 20);

    // Show back-to-top button after scrolling down
    top && top.classList.toggle("show", scrollY > 600);

  }, { passive: true });


  // Scroll back to the top when button is clicked
  top && top.addEventListener("click", () => {
    scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });


  // =========================
  // Fade In Sections as You Scroll
  // =========================

  const io = new IntersectionObserver(es => {

    es.forEach(e => {

      if (e.isIntersecting) {

        // Reveal the element
        e.target.classList.add("in");

        // Stop observing after it becomes visible
        io.unobserve(e.target);

      }

    });

  }, {
    threshold: 0.12
  });


  // Find all elements that need to be revealed
  const reveal = root => {

    $$(".reveal:not(.in)", root).forEach((el, i) => {

      // Add a small delay between elements
      el.style.setProperty("--dl", (i % 4) * 0.08 + "s");

      // Start observing the element
      io.observe(el);

    });

  };

  reveal();


  // =========================
  // Cinema Schedule
  // Feature Page Only
  // =========================

  // Edit the cinemas and showtimes here
  const list = $("#cinemaList");
  const days = $("#days");
  const toast = $("#toast");

  if (list && days) {

    // Cinema Information
    const C = [

      {
        n: "Vigan Plaza Cinemas",
        h: "Cinema 2 · Japanese audio, English subs",
        p: 280,

        t: [
          ["10:30 AM", "1:45 PM", "5:00 PM", "8:15 PM"],
          ["11:00 AM", "2:15 PM", "6:30 PM"],
          ["10:00 AM", "1:15 PM", "4:30 PM", "7:45 PM"]
        ]
      },

      {
        n: "Laoag Metro Cinemas",
        h: "Cinema 4 · English dub",
        p: 260,

        t: [
          ["11:00 AM", "2:15 PM", "6:30 PM"],
          ["12:30 PM", "3:45 PM", "7:00 PM"],
          ["11:15 AM", "2:30 PM", "5:45 PM", "9:00 PM"]
        ]
      },

      {
        n: "Ilocos Grand Cinemas",
        h: "Cinema 1 · Japanese audio, English subs",
        p: 300,

        t: [
          ["12:00 PM", "3:30 PM", "7:00 PM"],
          ["1:00 PM", "4:15 PM", "7:30 PM"],
          ["12:15 PM", "3:00 PM", "6:15 PM"]
        ]
      }

    ];


    // Selected day and toast timer
    let d = 0;
    let timer;


    // Generate the day label
    const label = i => {

      if (i === 0) {
        return "Today";
      }

      return new Date(Date.now() + i * 864e5)
        .toLocaleDateString("en", {
          weekday: "short",
          month: "short",
          day: "numeric"
        });

    };


    // =========================
    // Display Cinema Schedule
    // =========================

    const draw = () => {

      // Generate day selection buttons
      days.innerHTML = [0, 1, 2].map(i => `

        <button class="btn btn-day ${i === d ? "active" : ""}"
                data-d="${i}">

          ${label(i)}

        </button>

      `).join("");


      // Generate cinema cards and showtimes
      list.innerHTML = C.map(c => `

        <div class="col-md-6 col-lg-4">

          <div class="card h-100 p-3 reveal">

            <h5>
              <i class="bi bi-geo-alt-fill text-danger"></i>
              ${c.n}
            </h5>

            <p class="mb-1 small text-secondary">
              ${c.h}
            </p>

            <div>

              ${c.t[d].map(t => `

                <button class="time" data-c="${c.n}">
                  ${t}
                </button>

              `).join("")}

            </div>

            <p class="mt-2 mb-0 fw-bold">
              ₱${c.p}
            </p>

          </div>

        </div>

      `).join("");


      // Apply reveal animation to newly generated cards
      reveal(list);

    };


    // =========================
    // Day Selection
    // =========================

    days.addEventListener("click", e => {

      const b = e.target.closest("[data-d]");

      if (b) {

        // Update selected day
        d = +b.dataset.d;

        // Refresh cinema schedule
        draw();

      }

    });


    // =========================
    // Showtime Selection
    // =========================

    list.addEventListener("click", e => {

      const b = e.target.closest(".time");

      if (!b) {
        return;
      }


      // Remove previous selected showtime
      $$(".time.picked").forEach(x => {
        x.classList.remove("picked");
      });


      // Highlight selected showtime
      b.classList.add("picked");


      // Display selected showtime in toast
      toast.textContent =
        `${b.textContent} at ${b.dataset.c}, ${label(d)}`;

      toast.classList.add("show");


      // Reset toast timer
      clearTimeout(timer);

      timer = setTimeout(() => {
        toast.classList.remove("show");
      }, 2500);

    });


    // Initial cinema schedule
    draw();

  }

})();
