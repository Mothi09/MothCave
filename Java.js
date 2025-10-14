document.querySelector('.dropdown-toggle').addEventListener('click', function() {
  document.querySelector('.dropdown-content').classList.toggle('show');
});

// Optional: Close dropdown when clicking outside
window.addEventListener('click', function(event) {
  if (!event.target.matches('.dropdown-toggle')) {
    var dropdowns = document.querySelectorAll('.dropdown-content');
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
});
