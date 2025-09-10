// UI 렌더링 관련 기능들
class UIRenderer {
    constructor() {
        this.expandedItems = {};
        this.productList = document.getElementById('productList');
        this.infoOverlay = document.getElementById('infoOverlay');
        this.filteredProducts = null; // 필터링된 상품 저장
        
        // 장바구니 업데이트 이벤트 리스너
        window.addEventListener('cartUpdated', (e) => {
            this.renderProducts();
        });
        
        // 정보 팝업 오버레이 클릭 이벤트
        this.infoOverlay.addEventListener('click', (e) => {
            if (e.target === this.infoOverlay) {
                this.hideInfoPopup();
            }
        });
    }
    
    // 상품 리스트 렌더링
    renderProducts() {
        this.productList.innerHTML = '';
        
        // 필터링된 상품이 있으면 사용, 없으면 전체 상품 사용
        const sectionsToRender = this.filteredProducts || productSections;
        
        sectionsToRender.forEach(section => {
            // 섹션 타이틀 추가
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'section-title';
            sectionTitle.textContent = section.title;
            this.productList.appendChild(sectionTitle);
            
            // 섹션 내 상품들 렌더링
            section.products.forEach(product => {
                const isSelected = cartManager.cart[product.id];
                const isExpanded = this.expandedItems[product.id];
                // 저장된 수량이 있으면 사용, 없으면 2로 설정 (최소 2일)
                const quantity = cartManager.quantities[product.id] || 2;
                const productTotal = product.price * quantity;
                
                // 수량 옵션 생성 (일 단위)
                const dayOptions = [2, 3, 4, 5, 6, 7, 15, 30];
                let quantityOptions = '';
                dayOptions.forEach(days => {
                    quantityOptions += `<option value="${days}" ${days === quantity ? 'selected' : ''}>${days}일</option>`;
                });
                
                const productElement = document.createElement('div');
                productElement.className = `product-item ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`;
                productElement.innerHTML = `
                    <div class="product-header" onclick="uiRenderer.toggleAccordion(${product.id})">
                        <input type="checkbox" class="product-checkbox" 
                               id="product-${product.id}" 
                               ${isSelected ? 'checked' : ''}
                               onclick="event.stopPropagation()">
                        <div class="product-info">
                            <div class="product-name">
                                ${product.name}
                                <img src="./icon/information.svg" class="info-icon" width="20" height="20" alt="정보" onclick="uiRenderer.showInfoPopup(event)">
                            </div>
                            <div class="product-price">${this.formatNumber(product.price)}<span class="price-unit">원/일</span></div>
                        </div>
                        <div class="accordion-icon ${isExpanded ? 'expanded' : ''}">
                            <img src="./icon/${isExpanded ? 'fold' : 'expand'}.svg" width="24" height="24" alt="${isExpanded ? '접기' : '펼치기'}">
                        </div>
                    </div>
                    <div class="product-content">
                        ${product.details && product.details.length > 0 ? `
                            <div class="product-details">
                                <ul class="detail-list">
                                    ${product.details.map(detail => `<li>${detail}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${product.note ? `
                            <div class="product-note">
                                ${product.note}
                            </div>
                        ` : ''}
                        ${product.name !== "무료등록" ? `
                            <div class="quantity-controls">
                                <div class="quantity-section">
                                    <select class="quantity-dropdown" onchange="cartManager.changeQuantity(${product.id}, this.value)">
                                        ${quantityOptions}
                                    </select>
                                </div>
                                <div class="quantity-amount">${this.formatNumber(productTotal)}<span class="price-unit">원</span></div>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                // 체크박스 이벤트 리스너 추가
                const checkbox = productElement.querySelector('.product-checkbox');
                checkbox.addEventListener('change', () => {
                    cartManager.toggleProduct(product);
                    
                    // 체크했을 때만 아코디언 펼치기 (체크 해제 시에는 그대로 유지)
                    if (checkbox.checked) {
                        this.expandedItems[product.id] = true;
                        this.renderProducts();
                    }
                });
                
                this.productList.appendChild(productElement);
            });
        });
    }
    
    // 아코디언 토글
    toggleAccordion(productId) {
        this.expandedItems[productId] = !this.expandedItems[productId];
        this.renderProducts();
    }
    
    // 숫자 포맷팅
    formatNumber(num) {
        return num.toLocaleString('ko-KR');
    }
    
    // 상품 찾기 헬퍼 함수
    findProduct(productId) {
        for (const section of productSections) {
            const product = section.products.find(p => p.id === productId);
            if (product) return product;
        }
        return null;
    }
    
    // 정보 팝업 보이기
    showInfoPopup(event) {
        event.stopPropagation();
        this.infoOverlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    }
    
    // 정보 팝업 숨기기
    hideInfoPopup() {
        this.infoOverlay.classList.remove('show');
        document.body.style.overflow = ''; // 배경 스크롤 복원
    }
    
    // 랜덤 4개 상품 필터링
    applyRandomFilter(goalValue, budgetValue) {
        // 모든 상품을 하나의 배열로 합치기
        let allProducts = [];
        productSections.forEach(section => {
            section.products.forEach(product => {
                allProducts.push({
                    ...product,
                    sectionTitle: section.title
                });
            });
        });
        
        // 랜덤하게 4개 선택
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        const selectedProducts = shuffled.slice(0, 4);
        
        // 선택된 상품들을 섹션별로 그룹화
        const groupedBySections = {};
        selectedProducts.forEach(product => {
            if (!groupedBySections[product.sectionTitle]) {
                groupedBySections[product.sectionTitle] = {
                    title: product.sectionTitle,
                    products: []
                };
            }
            // sectionTitle 제거하고 원본 상품 데이터만 저장
            const { sectionTitle, ...productData } = product;
            groupedBySections[product.sectionTitle].products.push(productData);
        });
        
        // 필터링된 섹션 배열로 변환
        this.filteredProducts = Object.values(groupedBySections);
        
        // 리렌더링
        this.renderProducts();
        
        // 필터 조건 텍스트 생성 및 표시 (렌더링 후)
        this.showFilterTags(goalValue, budgetValue);
        
        console.log('랜덤 4개 상품 필터링 적용:', selectedProducts.map(p => p.name));
    }
    
    // 모든 상품 표시 (필터 해제)
    showAllProducts() {
        this.filteredProducts = null;
        this.hideFilterTags(); // 필터 태그 제거
        this.renderProducts();
        console.log('모든 상품 표시로 복원');
    }
    
    // 필터 조건 태그 표시
    showFilterTags(goalValue, budgetValue) {
        console.log('showFilterTags 호출:', goalValue, budgetValue);
        
        // 기존 필터 태그 제거
        this.hideFilterTags();
        
        // 목표 텍스트 매핑
        const goalTexts = {
            'visibility': '많은 사람에게',
            'awareness': '급하게',
            'professional': '전문적으로',
            'careful': '눈에 띄게'
        };
        
        // 예산 텍스트 매핑
        const budgetTexts = {
            0: '적은 예산으로',
            1: '보통 예산으로',
            2: '많은 예산으로'
        };
        
        const goalText = goalTexts[goalValue] || '';
        const budgetText = budgetTexts[budgetValue] || '';
        
        console.log('태그 텍스트:', goalText, budgetText);
        
        // 필터 태그 요소 생성
        const filterTags = document.createElement('div');
        filterTags.className = 'filter-tags';
        filterTags.innerHTML = `#${goalText} #${budgetText}`;
        
        console.log('태그 요소 생성:', filterTags.innerHTML);
        
        // 상품 리스트 상단에 삽입
        if (this.productList && this.productList.firstChild) {
            this.productList.insertBefore(filterTags, this.productList.firstChild);
            console.log('태그가 상품 리스트에 삽입됨');
        } else {
            this.productList.appendChild(filterTags);
            console.log('태그가 상품 리스트에 추가됨');
        }
    }
    
    // 필터 조건 태그 제거
    hideFilterTags() {
        const existingTags = this.productList.querySelector('.filter-tags');
        if (existingTags) {
            existingTags.remove();
        }
    }
}

// 전역 UI 렌더러 인스턴스
let uiRenderer = null;
