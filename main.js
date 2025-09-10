// 메인 스크립트 - 초기화 및 조정
document.addEventListener('DOMContentLoaded', () => {
    // 클래스 인스턴스 생성
    cartManager = new CartManager();
    uiRenderer = new UIRenderer();
    
    // 초기 렌더링
    uiRenderer.renderProducts();
    cartManager.updateDisplay();
    
    // 정렬 드롭다운 초기화
    initSortDropdown();
});

// 정렬 드롭다운 기능
function initSortDropdown() {
    const sortButton = document.getElementById('sortButton');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortText = document.getElementById('sortText');
    const dropdownOptions = document.querySelectorAll('.dropdown-option');
    
    // 버튼 클릭 시 드롭다운 토글
    sortButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sortDropdown.classList.toggle('show');
    });
    
    // 옵션 선택 시
    dropdownOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const selectedValue = e.target.dataset.value;
            const selectedText = e.target.textContent;
            
            // 텍스트 업데이트
            sortText.textContent = selectedText;
            
            // 선택된 옵션 표시
            dropdownOptions.forEach(opt => opt.classList.remove('selected'));
            e.target.classList.add('selected');
            
            // 드롭다운 닫기
            sortDropdown.classList.remove('show');
            
            // 여기에서 실제 정렬 로직을 추가할 수 있습니다 (현재는 텍스트만 변경)
            console.log('정렬 방식 변경:', selectedValue, selectedText);
        });
    });
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', () => {
        sortDropdown.classList.remove('show');
    });
    
    // 기본값으로 '기본순' 선택 상태로 설정
    dropdownOptions[0].classList.add('selected');
}

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
