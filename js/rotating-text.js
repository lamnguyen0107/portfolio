document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.rotating-text-wrapper');
    if (!wrapper) return;

    const items = wrapper.querySelectorAll('.rotating-text-item');
    if (items.length < 2) return;

    // Split text into individual letters for staggered animation
    items.forEach(item => {
        const text = item.textContent;
        item.innerHTML = '';
        [...text].forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            item.appendChild(span);
        });
    });

    // Set all items to absolute so they stack
    gsap.set(items, { 
        position: 'absolute', 
        opacity: 0
    });
    
    // Ensure fonts are parsed before getting initial width
    setTimeout(() => {
        // Init the first item
        gsap.set(items[0], { opacity: 1 });
        gsap.set(items[0].querySelectorAll('span'), { y: "0%", opacity: 1 });
        wrapper.style.width = items[0].offsetWidth + 'px';

        let currentIndex = 0;
        const duration = 0.6; // Speed of each letter sliding
        const staggerDelay = 0.025; // 25ms delay between each letter
        const cycleTime = 3000; // Total time each word stays

        function rotateText() {
            const currentItem = items[currentIndex];
            const nextIndex = (currentIndex + 1) % items.length;
            const nextItem = items[nextIndex];

            // Next item needs its layout calculated
            gsap.set(nextItem, { opacity: 1 });
            const targetWidth = nextItem.offsetWidth;

            // Animate wrapper width smoothly
            gsap.to(wrapper, {
                width: targetWidth,
                duration: duration + (nextItem.textContent.length * staggerDelay), // expand duration slightly based on word length
                ease: "power3.inOut"
            });

            // Animate out current letters (slide UP)
            gsap.to(currentItem.querySelectorAll('span'), {
                y: "-120%",
                opacity: 0,
                duration: duration,
                stagger: staggerDelay,
                ease: "power3.inOut",
                onComplete: () => {
                    gsap.set(currentItem, { opacity: 0 }); // Hide container when finished
                }
            });

            // Animate in next letters (slide UP from bottom)
            gsap.fromTo(nextItem.querySelectorAll('span'), {
                y: "120%",
                opacity: 0,
            }, {
                y: "0%",
                opacity: 1,
                duration: duration,
                stagger: staggerDelay,
                ease: "power3.inOut"
            });

            currentIndex = nextIndex;
            setTimeout(rotateText, cycleTime);
        }

        setTimeout(rotateText, cycleTime);
    }, 100);
});
