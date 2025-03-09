document.addEventListener("DOMContentLoaded", function () {
    let currentIndex = 0;
    const images = document.querySelectorAll('.carousel-images img');
    const totalImages = images.length;
    const leftBtn = document.querySelector('.left-btn');
    const rightBtn = document.querySelector('.right-btn');
    let autoSlideInterval;

  
    function moveSlide(step) {
        currentIndex += step;

        if (currentIndex < 0) {
            currentIndex = totalImages - 1; 
        } else if (currentIndex >= totalImages) {
            currentIndex = 0;  
        }

        const offset = -currentIndex * 100;
        document.querySelector('.carousel-images').style.transform = `translateX(${offset}%)`;
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            moveSlide(1);
        }, 3000);
    }


    autoSlideInterval = setInterval(() => {
        moveSlide(1);
    }, 3000);


    leftBtn.addEventListener("click", function () {
        moveSlide(-1);
        resetAutoSlide();
    });

    rightBtn.addEventListener("click", function () {
        moveSlide(1);
        resetAutoSlide();
    });


});
