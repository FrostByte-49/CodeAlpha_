// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark-mode');
        iconSun.classList.add('hidden');
        iconMoon.classList.remove('hidden');
    }

    themeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        if (isDark) {
            iconSun.classList.add('hidden');
            iconMoon.classList.remove('hidden');
        } else {
            iconMoon.classList.add('hidden');
            iconSun.classList.remove('hidden');
        }
    });

    // Age Calculator Functionality
    const ageForm = document.getElementById('ageForm');
    const clearBtn = document.getElementById('clearBtn');
    const resultContainer = document.getElementById('result');
    const errorContainer = document.getElementById('error');
    const ageDisplay = document.getElementById('ageDisplay');
    const dayInput = document.getElementById('day');
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');

    ageForm.addEventListener('submit', function (e) {
        e.preventDefault();
        calculateAge();
    });

    clearBtn.addEventListener('click', function () {
        clearAll();
    });

    function calculateAge() {
        hideResults();

        const day = parseInt(dayInput.value);
        const month = parseInt(monthInput.value);
        const year = parseInt(yearInput.value);

        if (!isValidDate(day, month, year)) {
            showError('Please enter a valid date');
            return;
        }

        const age = getAgeDetails(day, month, year);

        if (age) {
            showResult(age);
        } else {
            showError('Invalid date or future date entered');
        }
    }

    function isValidDate(day, month, year) {
        if (isNaN(day) || isNaN(month) || isNaN(year) ||
            day < 1 || day > 31 ||
            month < 1 || month > 12 ||
            year < 1900 || year > new Date().getFullYear()) {
            return false;
        }

        if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) {
            return false;
        }

        if (month === 2) {
            const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
            if (isLeapYear && day > 29) {
                return false;
            }
            if (!isLeapYear && day > 28) {
                return false;
            }
        }

        return true;
    }

    function getAgeDetails(day, month, year) {
        const today = new Date();
        const birthDate = new Date(year, month - 1, day);

        if (birthDate > today) {
            return null;
        }

        let ageYears = today.getFullYear() - birthDate.getFullYear();
        let ageMonths = today.getMonth() - birthDate.getMonth();
        let ageDays = today.getDate() - birthDate.getDate();

        if (ageDays < 0) {
            ageMonths--;
            const lastDayOfLastMonth = new Date(
                today.getFullYear(),
                today.getMonth(),
                0
            ).getDate();
            ageDays += lastDayOfLastMonth;
        }

        if (ageMonths < 0) {
            ageYears--;
            ageMonths += 12;
        }

        return {
            years: ageYears,
            months: ageMonths,
            days: ageDays
        };
    }

    function showResult(age) {
        ageDisplay.textContent = `${age.years} years, ${age.months} months, ${age.days} days`;
        resultContainer.style.display = 'block';
        errorContainer.style.display = 'none';
    }

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        resultContainer.style.display = 'none';
    }

    function hideResults() {
        resultContainer.style.display = 'none';
        errorContainer.style.display = 'none';
    }

    function clearAll() {
        ageForm.reset();
        hideResults();
    }
});