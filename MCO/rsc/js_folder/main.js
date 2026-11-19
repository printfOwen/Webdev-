
// =========================
// Helper Functions
// =========================

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);


// =========================
// Navbar and Back-to-Top
// =========================

const nav = $(".site-nav");
const topButton = $("#top");

window.addEventListener("scroll", function () {

  // Navbar shadow
  if (nav) {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  }

  // Back-to-top button
  if (topButton) {
    topButton.classList.toggle("show", window.scrollY > 600);
  }

  // Fade-in animation
  $$(".reveal").forEach(function (section) {
    if (section.getBoundingClientRect().top < window.innerHeight - 50) {
      section.classList.add("in");
    }
  });

});

// Scroll to top
if (topButton) {
  topButton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


// =========================
// Cinema Schedule
// =========================

const list = $("#cinemaList");
const days = $("#days");
const toast = $("#toast");

if (list && days) {

  // Cinema information
  const cinemas = [
    {
      name: "Vigan Plaza Cinemas",
      details: "Cinema 2 · Japanese audio, English subs",
      price: 280,
      times: ["10:30 AM", "1:45 PM", "5:00 PM", "8:15 PM"]
    },
    {
      name: "Laoag Metro Cinemas",
      details: "Cinema 4 · English dub",
      price: 260,
      times: ["11:00 AM", "2:15 PM", "6:30 PM"]
    },
    {
      name: "Ilocos Grand Cinemas",
      details: "Cinema 1 · Japanese audio, English subs",
      price: 300,
      times: ["12:00 PM", "3:30 PM", "7:00 PM"]
    }
  ];

  let selectedDay = "Today";


  // Create day buttons
  days.innerHTML = `
    <button class="btn btn-day active">Today</button>
    <button class="btn btn-day">Tomorrow</button>
    <button class="btn btn-day">Next Day</button>
  `;


  // Create cinema cards
  cinemas.forEach(function (cinema) {

    let showtimes = "";

    cinema.times.forEach(function (time) {
      showtimes += `
        <button class="time" data-cinema="${cinema.name}">
          ${time}
        </button>
      `;
    });

    list.innerHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 p-3">

          <h5>
            <i class="bi bi-geo-alt-fill text-danger"></i>
            ${cinema.name}
          </h5>

          <p class="mb-1 small text-secondary">
            ${cinema.details}
          </p>

          <div>${showtimes}</div>

          <p class="mt-2 mb-0 fw-bold">₱${cinema.price}</p>

        </div>
      </div>
    `;

  });


  // Select a day
  $$(".btn-day").forEach(function (button) {

    button.addEventListener("click", function () {

      $$(".btn-day").forEach(function (day) {
        day.classList.remove("active");
      });

      button.classList.add("active");
      selectedDay = button.textContent;

    });

  });


  // Select a showtime
  $$(".time").forEach(function (button) {

    button.addEventListener("click", function () {

      $$(".time").forEach(function (time) {
        time.classList.remove("picked");
      });

      button.classList.add("picked");

      if (toast) {
        toast.textContent =
          button.textContent + " at " +
          button.dataset.cinema + ", " + selectedDay;

        toast.classList.add("show");

        setTimeout(function () {
          toast.classList.remove("show");
        }, 2500);
      }

    });

  });

}
