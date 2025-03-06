let currentIndex = 0;

const images = document.querySelectorAll('.carousel-images img');
const totalImages = images.length;

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

setInterval(() => {
    moveSlide(1); 
}, 3000);  
