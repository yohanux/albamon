// 장바구니 관련 기능들
class CartManager {
    constructor() {
        this.cart = {};
        this.quantities = {}; // 모든 상품의 수량을 저장 (체크 여부와 관계없이)
        this.isBottomSheetOpen = false;
        this.isDragging = false;
        this.startY = 0;
        this.currentY = 0;
        
        // DOM 요소들
        this.cartItemsContainer = document.getElementById('cartItemsContainer');
        this.bottomSheetHandle = document.getElementById('bottomSheetHandle');
        this.cartItems = document.getElementById('cartItems');
        this.cartBtn = document.getElementById('cartBtn');
        this.applyBtn = document.getElementById('applyBtn');
        this.totalPrice = document.getElementById('totalPrice');
        this.cartBadge = document.getElementById('cartBadge');
        
        this.init();
        this.updateCartBadge(0); // 초기에는 배지 숨김
    }
    
    init() {
        // 이벤트 리스너 설정
        this.cartBtn.addEventListener('click', () => this.toggleBottomSheet());
        this.applyBtn.addEventListener('click', () => this.handleApply());
        
        // 드래그 이벤트 설정
        this.bottomSheetHandle.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.bottomSheetHandle.addEventListener('touchstart', (e) => this.handleTouchStart(e), {passive: false});
    }
    
    // 상품 추가/제거
    toggleProduct(product) {
        if (this.cart[product.id]) {
            delete this.cart[product.id];
        } else {
            // 무료등록 상품은 수량 1로 고정, 나머지는 저장된 수량 또는 2로 설정
            const quantity = product.name === "무료등록" ? 1 : (this.quantities[product.id] || 2);
            this.cart[product.id] = {
                ...product,
                quantity: quantity
            };
        }
        this.updateDisplay();
    }
    
    // 수량 변경
    changeQuantity(productId, newQuantity) {
        // 무료등록 상품은 수량 변경 불가
        const product = this.findProduct(productId);
        if (product && product.name === "무료등록") {
            return;
        }
        
        const quantity = parseInt(newQuantity);
        
        // 모든 상품의 수량을 quantities에 저장 (체크 여부와 관계없이)
        this.quantities[productId] = quantity;
        
        // 만약 체크된 상품이라면 cart에도 수량 업데이트
        if (this.cart[productId]) {
            this.cart[productId].quantity = quantity;
        }
        
        this.updateDisplay();
    }
    
    // 총 금액과 상품 개수 계산
    calculateTotals() {
        let itemCount = 0;
        let selectedProductCount = 0; // 선택된 상품 종류 개수
        let totalAmount = 0;
        
        Object.values(this.cart).forEach(item => {
            itemCount += item.quantity;
            selectedProductCount += 1; // 상품 종류 개수
            totalAmount += item.price * item.quantity;
        });
        
        return { itemCount, selectedProductCount, totalAmount };
    }
    
    // 화면 업데이트
    updateDisplay() {
        const { itemCount, selectedProductCount, totalAmount } = this.calculateTotals();
        
        // 총 금액 업데이트
        this.totalPrice.textContent = this.formatNumber(totalAmount);
        
        // 신청 버튼 활성화/비활성화
        this.applyBtn.disabled = itemCount === 0;
        
        // 장바구니 배지 업데이트
        this.updateCartBadge(selectedProductCount);
        
        // 장바구니가 확장되어 있으면 내용 업데이트
        if (this.isBottomSheetOpen) {
            this.renderCartItems();
        }
        
        // 상품 리스트 업데이트를 위해 이벤트 발생
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.cart }));
    }
    
    // 장바구니 배지 업데이트
    updateCartBadge(count) {
        if (count > 0) {
            this.cartBadge.textContent = count;
            this.cartBadge.classList.remove('hidden');
        } else {
            this.cartBadge.classList.add('hidden');
        }
    }
    
    // 장바구니 토글
    toggleBottomSheet() {
        this.isBottomSheetOpen = !this.isBottomSheetOpen;
        if (this.isBottomSheetOpen) {
            this.cartItemsContainer.classList.add('expanded');
            this.renderCartItems();
        } else {
            this.cartItemsContainer.classList.remove('expanded');
        }
    }
    
    // 장바구니 열기
    openBottomSheet() {
        if (!this.isBottomSheetOpen) {
            this.isBottomSheetOpen = true;
            this.cartItemsContainer.classList.add('expanded');
            this.renderCartItems();
        }
    }
    
    // 장바구니 닫기
    closeBottomSheet() {
        if (this.isBottomSheetOpen) {
            this.isBottomSheetOpen = false;
            this.cartItemsContainer.classList.remove('expanded');
        }
    }
    
    // 장바구니 아이템들 렌더링
    renderCartItems() {
        this.cartItems.innerHTML = '';
        
        if (Object.keys(this.cart).length === 0) {
            this.cartItems.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">선택된 상품이 없습니다.</div>';
            return;
        }
        
        Object.values(this.cart).forEach(item => {
            const itemTotal = item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            // 무료등록 상품인지 확인
            const isFreeProduct = item.name === "무료등록";
            
            // 드롭다운 옵션 생성
            let quantityOptions = '';
            if (!isFreeProduct) {
                const dayOptions = [2, 3, 4, 5, 6, 7, 15, 30];
                dayOptions.forEach(days => {
                    quantityOptions += `<option value="${days}" ${days === item.quantity ? 'selected' : ''}>${days}일</option>`;
                });
            }
            
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${this.formatNumber(itemTotal)}<span class="cart-item-price-unit">원</span></div>
                </div>
                <div class="cart-item-controls">
                    ${!isFreeProduct ? `
                        <select class="cart-item-dropdown" onchange="cartManager.changeQuantity(${item.id}, this.value)">
                            ${quantityOptions}
                        </select>
                    ` : ''}
                </div>
            `;
            this.cartItems.appendChild(cartItem);
        });
    }
    
    // 신청하기 처리
    handleApply() {
        const { itemCount, totalAmount } = this.calculateTotals();
        
        if (itemCount === 0) {
            alert('상품을 선택해주세요.');
            return;
        }
        
        // 신청 내역 생성
        let applyDetails = '=== 신청 내역 ===\n\n';
        Object.values(this.cart).forEach(item => {
            const itemTotal = item.price * item.quantity;
            applyDetails += `${item.name}\n`;
            applyDetails += `단가: ${this.formatNumber(item.price)}원 × ${item.quantity}개 = ${this.formatNumber(itemTotal)}원\n\n`;
        });
        applyDetails += `총 ${itemCount}개 상품\n`;
        applyDetails += `총 신청금액: ${this.formatNumber(totalAmount)}원`;
        
        // 신청 확인
        if (confirm(applyDetails + '\n\n신청하시겠습니까?')) {
            alert('신청이 완료되었습니다!');
            // 신청 완료 후 장바구니 초기화
            this.cart = {};
            this.isBottomSheetOpen = false;
            this.cartItemsContainer.classList.remove('expanded');
            this.updateDisplay();
        }
    }
    
    // 상품의 현재 수량 가져오기
    getQuantity(productId) {
        return this.quantities[productId] || 2;
    }
    
    // 상품 찾기 헬퍼 함수
    findProduct(productId) {
        for (const section of productSections) {
            const product = section.products.find(p => p.id === productId);
            if (product) return product;
        }
        return null;
    }
    
    // 숫자 포맷팅
    formatNumber(num) {
        return num.toLocaleString('ko-KR');
    }
    
    // 드래그 이벤트 처리
    handleMouseDown(e) {
        this.isDragging = true;
        this.startY = e.clientY;
        this.currentY = e.clientY;
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    
    handleTouchStart(e) {
        this.isDragging = true;
        this.startY = e.touches[0].clientY;
        this.currentY = e.touches[0].clientY;
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), {passive: false});
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        // 배경 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        this.currentY = e.clientY;
        const deltaY = this.currentY - this.startY;
        
        // 드래그 시 시각적 피드백 (선택사항)
        if (this.isBottomSheetOpen && deltaY > 0) {
            // 아래로 드래그할 때 살짝 줄어드는 효과
            const progress = Math.min(deltaY / 100, 1);
            this.cartItemsContainer.style.opacity = 1 - progress * 0.3;
        } else if (!this.isBottomSheetOpen && deltaY < 0) {
            // 위로 드래그할 때 살짝 나타나는 효과
            const progress = Math.min(Math.abs(deltaY) / 100, 1);
            this.cartItemsContainer.style.opacity = progress * 0.3;
        }
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        // 배경 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        this.currentY = e.touches[0].clientY;
        const deltaY = this.currentY - this.startY;
        
        // 드래그 시 시각적 피드백 (터치)
        if (this.isBottomSheetOpen && deltaY > 0) {
            const progress = Math.min(deltaY / 100, 1);
            this.cartItemsContainer.style.opacity = 1 - progress * 0.3;
        } else if (!this.isBottomSheetOpen && deltaY < 0) {
            const progress = Math.min(Math.abs(deltaY) / 100, 1);
            this.cartItemsContainer.style.opacity = progress * 0.3;
        }
    }
    
    handleMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        // 배경 스크롤 복원
        document.body.style.overflow = '';
        
        const deltaY = this.currentY - this.startY;
        
        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0 && this.isBottomSheetOpen) {
                this.closeBottomSheet();
            } else if (deltaY < 0 && !this.isBottomSheetOpen) {
                this.openBottomSheet();
            }
        }
        
        // 드래그 완료 후 스타일 리셋
        this.cartItemsContainer.style.opacity = '';
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        // 배경 스크롤 복원
        document.body.style.overflow = '';
        
        const deltaY = this.currentY - this.startY;
        
        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0 && this.isBottomSheetOpen) {
                this.closeBottomSheet();
            } else if (deltaY < 0 && !this.isBottomSheetOpen) {
                this.openBottomSheet();
            }
        }
        
        // 드래그 완료 후 스타일 리셋
        this.cartItemsContainer.style.opacity = '';
        
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}

// 전역 장바구니 매니저 인스턴스
let cartManager = null;
