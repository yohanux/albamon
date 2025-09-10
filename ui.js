// UI 렌더링 관련 기능들
class UIRenderer {
    constructor() {
        this.expandedItems = {};
        this.productList = document.getElementById('productList');
        
        // 장바구니 업데이트 이벤트 리스너
        window.addEventListener('cartUpdated', (e) => {
            this.renderProducts();
        });
    }
    
    // 상품 리스트 렌더링
    renderProducts() {
        this.productList.innerHTML = '';
        
        productSections.forEach(section => {
            // 섹션 타이틀 추가
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'section-title';
            sectionTitle.textContent = section.title;
            this.productList.appendChild(sectionTitle);
            
            // 섹션 내 상품들 렌더링
            section.products.forEach(product => {
                const isSelected = cartManager.cart[product.id];
                const isExpanded = this.expandedItems[product.id];
                const quantity = isSelected ? cartManager.cart[product.id].quantity : 1;
                const productTotal = product.price * quantity;
                
                // 수량 옵션 생성 (1-10개)
                let quantityOptions = '';
                for (let i = 1; i <= 10; i++) {
                    quantityOptions += `<option value="${i}" ${i === quantity ? 'selected' : ''}>${i}</option>`;
                }
                
                const productElement = document.createElement('div');
                productElement.className = `product-item ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`;
                productElement.innerHTML = `
                    <div class="product-header" onclick="uiRenderer.toggleAccordion(${product.id})">
                        <input type="checkbox" class="product-checkbox" 
                               id="product-${product.id}" 
                               ${isSelected ? 'checked' : ''}
                               onclick="event.stopPropagation()">
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-price">${this.formatNumber(product.price)}원</div>
                        </div>
                        <div class="accordion-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 10l5 5 5-5z"/>
                            </svg>
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
                        ${isSelected ? `
                            <div class="quantity-controls">
                                <div class="quantity-section">
                                    <select class="quantity-dropdown" onchange="cartManager.changeQuantity(${product.id}, this.value)">
                                        ${quantityOptions}
                                    </select>
                                </div>
                                <div class="quantity-amount">${this.formatNumber(productTotal)}원</div>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                // 체크박스 이벤트 리스너 추가
                const checkbox = productElement.querySelector('.product-checkbox');
                checkbox.addEventListener('change', () => {
                    cartManager.toggleProduct(product);
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
}

// 전역 UI 렌더러 인스턴스
let uiRenderer = null;
