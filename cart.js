// 장바구니 관련 기능들
class CartManager {
    constructor() {
        this.cart = {};
        this.isBottomSheetOpen = false;
        this.isDragging = false;
        this.startY = 0;
        this.currentY = 0;
        
        // DOM 요소들
        this.cartBottomSheet = document.getElementById('cartBottomSheet');
        this.bottomSheetHandle = document.getElementById('bottomSheetHandle');
        this.cartItems = document.getElementById('cartItems');
        this.cartBtn = document.getElementById('cartBtn');
        this.applyBtn = document.getElementById('applyBtn');
        this.totalPrice = document.getElementById('totalPrice');
        
        this.init();
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
            this.cart[product.id] = {
                ...product,
                quantity: 1
            };
        }
        this.updateDisplay();
    }
    
    // 수량 변경
    changeQuantity(productId, newQuantity) {
        if (this.cart[productId]) {
            this.cart[productId].quantity = parseInt(newQuantity);
            this.updateDisplay();
        }
    }
    
    // 총 금액과 상품 개수 계산
    calculateTotals() {
        let itemCount = 0;
        let totalAmount = 0;
        
        Object.values(this.cart).forEach(item => {
            itemCount += item.quantity;
            totalAmount += item.price * item.quantity;
        });
        
        return { itemCount, totalAmount };
    }
    
    // 화면 업데이트
    updateDisplay() {
        const { itemCount, totalAmount } = this.calculateTotals();
        
        // 총 금액 업데이트
        this.totalPrice.textContent = this.formatNumber(totalAmount);
        
        // 신청 버튼 활성화/비활성화
        this.applyBtn.disabled = itemCount === 0;
        
        // 바텀시트가 열려있으면 장바구니 내용 업데이트
        if (this.isBottomSheetOpen) {
            this.renderCartItems();
        }
        
        // 상품 리스트 업데이트를 위해 이벤트 발생
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.cart }));
    }
    
    // 바텀시트 토글
    toggleBottomSheet() {
        this.isBottomSheetOpen = !this.isBottomSheetOpen;
        if (this.isBottomSheetOpen) {
            this.cartBottomSheet.classList.add('show');
            this.renderCartItems();
        } else {
            this.cartBottomSheet.classList.remove('show');
        }
    }
    
    // 바텀시트 열기
    openBottomSheet() {
        if (!this.isBottomSheetOpen) {
            this.isBottomSheetOpen = true;
            this.cartBottomSheet.classList.add('show');
            this.renderCartItems();
        }
    }
    
    // 바텀시트 닫기
    closeBottomSheet() {
        if (this.isBottomSheetOpen) {
            this.isBottomSheetOpen = false;
            this.cartBottomSheet.classList.remove('show');
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
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${this.formatNumber(item.price)}원</div>
                </div>
                <div class="cart-item-quantity">${item.quantity}개 / ${this.formatNumber(itemTotal)}원</div>
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
            this.cartBottomSheet.classList.remove('show');
            this.updateDisplay();
        }
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
        this.currentY = e.clientY;
        const deltaY = this.currentY - this.startY;
        
        if (this.isBottomSheetOpen && deltaY > 0) {
            const progress = Math.min(deltaY / 100, 1);
            this.cartBottomSheet.style.transform = `translateX(-50%) translateY(calc(-90px + ${deltaY}px))`;
        } else if (!this.isBottomSheetOpen && deltaY < 0) {
            const progress = Math.min(Math.abs(deltaY) / 100, 1);
            this.cartBottomSheet.style.transform = `translateX(-50%) translateY(calc(100% + ${deltaY}px))`;
        }
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.currentY = e.touches[0].clientY;
        const deltaY = this.currentY - this.startY;
        
        if (this.isBottomSheetOpen && deltaY > 0) {
            this.cartBottomSheet.style.transform = `translateX(-50%) translateY(calc(-90px + ${deltaY}px))`;
        } else if (!this.isBottomSheetOpen && deltaY < 0) {
            this.cartBottomSheet.style.transform = `translateX(-50%) translateY(calc(100% + ${deltaY}px))`;
        }
    }
    
    handleMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        const deltaY = this.currentY - this.startY;
        
        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0 && this.isBottomSheetOpen) {
                this.closeBottomSheet();
            } else if (deltaY < 0 && !this.isBottomSheetOpen) {
                this.openBottomSheet();
            } else {
                this.cartBottomSheet.style.transform = '';
            }
        } else {
            this.cartBottomSheet.style.transform = '';
        }
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        const deltaY = this.currentY - this.startY;
        
        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0 && this.isBottomSheetOpen) {
                this.closeBottomSheet();
            } else if (deltaY < 0 && !this.isBottomSheetOpen) {
                this.openBottomSheet();
            } else {
                this.cartBottomSheet.style.transform = '';
            }
        } else {
            this.cartBottomSheet.style.transform = '';
        }
        
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}

// 전역 장바구니 매니저 인스턴스
let cartManager = null;
