// 메인 스크립트 - 초기화 및 조정
document.addEventListener('DOMContentLoaded', () => {
    // 클래스 인스턴스 생성
    cartManager = new CartManager();
    uiRenderer = new UIRenderer();
    
    // 초기 렌더링
    uiRenderer.renderProducts();
    cartManager.updateDisplay();
});

// 터치 이벤트 최적화 (모바일)
document.addEventListener('touchstart', function() {}, {passive: true});

// 스크롤 성능 최적화
let ticking = false;
document.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            ticking = false;
        });
        ticking = true;
    }
});
