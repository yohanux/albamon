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
    
    // 맞춤 조건 모달 초기화
    initCustomFilterModal();
    
    // 초기화 버튼 기능
    initResetButton();
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

// 맞춤 조건 모달 기능
function initCustomFilterModal() {
    const customFilterBtn = document.querySelector('.filter-btn:first-child');
    const customFilterOverlay = document.getElementById('customFilterOverlay');
    const customFilterModal = document.getElementById('customFilterModal');
    const closeCustomFilterBtn = document.getElementById('closeCustomFilter');
    const confirmCustomFilterBtn = document.getElementById('confirmCustomFilter');
    
    // 저장된 설정값
    let savedSettings = {
        goal: null,
        budget: null,
        isConfigured: false
    };
    
    // 슬라이더 요소들
    const sliderThumb = document.getElementById('sliderThumb');
    const sliderProgress = document.getElementById('sliderProgress');
    const sliderLabels = document.querySelectorAll('.slider-label');
    
    let currentSliderValue = 0;
    let isDragging = false;
    
    // 맞춤 조건 버튼 클릭 시 모달 열기
    customFilterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        customFilterOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // 저장된 설정값 복원
        restoreSettings();
    });
    
    // 모달 닫기 함수
    function closeModal() {
        customFilterOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    // X 버튼 클릭 시 모달 닫기
    closeCustomFilterBtn.addEventListener('click', closeModal);
    
    // 오버레이 클릭 시 모달 닫기
    customFilterOverlay.addEventListener('click', (e) => {
        if (e.target === customFilterOverlay) {
            closeModal();
        }
    });
    
    // 슬라이더 기능
    function updateSlider(value) {
        currentSliderValue = Math.max(0, Math.min(2, value));
        const percentage = (currentSliderValue / 2) * 100;
        
        sliderThumb.style.left = percentage + '%';
        sliderProgress.style.width = percentage + '%';
        
        // 라벨 활성화 상태 업데이트
        sliderLabels.forEach((label, index) => {
            if (index === currentSliderValue) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
    }
    
    // 슬라이더 라벨 클릭
    sliderLabels.forEach((label, index) => {
        label.addEventListener('click', () => {
            updateSlider(index);
        });
    });
    
    // 슬라이더 드래그 시작
    function startDrag(e) {
        isDragging = true;
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', handleDrag);
        document.addEventListener('touchend', stopDrag);
        e.preventDefault();
    }
    
    // 슬라이더 드래그 중
    function handleDrag(e) {
        if (!isDragging) return;
        
        const sliderTrack = sliderThumb.parentElement;
        const rect = sliderTrack.getBoundingClientRect();
        let clientX = e.clientX || (e.touches && e.touches[0].clientX);
        
        const relativeX = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
        const value = Math.round((percentage / 100) * 2);
        
        updateSlider(value);
        e.preventDefault();
    }
    
    // 슬라이더 드래그 종료
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', handleDrag);
        document.removeEventListener('touchend', stopDrag);
    }
    
    // 슬라이더 썸 이벤트 리스너
    sliderThumb.addEventListener('mousedown', startDrag);
    sliderThumb.addEventListener('touchstart', startDrag);
    
    // 필터 버튼 활성화 상태 업데이트
    function updateFilterButtonState() {
        const filterIcon = customFilterBtn.querySelector('img');
        if (savedSettings.isConfigured) {
            customFilterBtn.classList.add('active');
            filterIcon.src = './icon/IconFilteron.svg';
            // 랜덤 4개 상품 필터링 적용 (설정값 전달)
            applyRandomFilter(savedSettings.goal, savedSettings.budget);
        } else {
            customFilterBtn.classList.remove('active');
            filterIcon.src = './icon/IconFilter.svg';
            // 모든 상품 표시
            showAllProducts();
        }
    }
    
    // 모달 열 때 저장된 설정값 복원
    function restoreSettings() {
        if (savedSettings.goal) {
            const goalRadio = document.querySelector(`input[name="goal"][value="${savedSettings.goal}"]`);
            if (goalRadio) {
                goalRadio.checked = true;
            }
        }
        if (savedSettings.budget !== null) {
            updateSlider(savedSettings.budget);
        }
    }
    
    // 설정 완료 버튼
    confirmCustomFilterBtn.addEventListener('click', () => {
        // 선택된 라디오 버튼 값 가져오기
        const selectedGoal = document.querySelector('input[name="goal"]:checked').value;
        
        // 설정값 저장
        savedSettings.goal = selectedGoal;
        savedSettings.budget = currentSliderValue;
        savedSettings.isConfigured = true;
        
        // 로컬 스토리지에 저장 (선택사항)
        localStorage.setItem('customFilterSettings', JSON.stringify(savedSettings));
        
        // 필터 버튼 활성화 상태 업데이트
        updateFilterButtonState();
        
        // 슬라이더 값과 라디오 값 로그
        console.log('맞춤 조건 설정 저장:', savedSettings);
        
        // 모달 닫기
        closeModal();
    });
    
    // 페이지 새로고침 시 모든 설정값 초기화
    localStorage.removeItem('customFilterSettings');
    console.log('페이지 로드 시 모든 설정값 초기화');
    
    // 초기 슬라이더 값 설정
    updateSlider(0);
    
    // 외부에서 접근 가능하도록 전역 함수로 노출
    window.resetCustomFilter = function() {
        savedSettings.goal = null;
        savedSettings.budget = null;
        savedSettings.isConfigured = false;
        
        // 로컬 스토리지에서 제거
        localStorage.removeItem('customFilterSettings');
        
        // 버튼 상태 업데이트
        updateFilterButtonState();
        
        console.log('맞춤 조건 필터 초기화 완료');
    };
}

// 랜덤 필터 적용 (전역 함수)
function applyRandomFilter(goalValue, budgetValue) {
    if (uiRenderer) {
        uiRenderer.applyRandomFilter(goalValue, budgetValue);
    }
}

// 모든 상품 표시 (전역 함수)
function showAllProducts() {
    if (uiRenderer) {
        uiRenderer.showAllProducts();
    }
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

// 초기화 버튼 기능
function initResetButton() {
    const resetButton = document.querySelector('.filter-btn:nth-child(2)'); // 두 번째 필터 버튼 (초기화)
    
    resetButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 맞춤 조건 필터 초기화
        if (typeof window.resetCustomFilter === 'function') {
            window.resetCustomFilter();
        }
        
        console.log('초기화 버튼 클릭 - 모든 필터 초기화');
    });
}
