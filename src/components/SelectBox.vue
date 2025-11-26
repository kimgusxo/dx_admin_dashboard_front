<template>
  <div class="store-select">
    <!-- Select Box -->
    <div
      class="dropdown"
      @click="toggleDropdown"
      @mouseover="hoverDropdown(true)"
      @mouseleave="hoverDropdown(false)"
    >
      <span class="selected-store">
        {{ selectedStoreName }}
      </span>
      <div class="dropdown-icon">
        <!-- 아이콘 필요하면 여기 넣기 -->
      </div>
    </div>

    <!-- Dropdown List -->
    <transition name="fade">
      <ul v-if="isOpen" class="store-list">
        <li
          v-for="store in stores"
          :key="store.storeId"
          class="store-item"
          @click="selectStore(store)"
        >
          {{ store.storeName }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStoreListStore } from "@/store/storeListStore"; 
// ↑ 파일 이름에 맞게 경로만 수정하면 됨
// 예: "@/store/StoreList" 또는 "@/store/storeListStore" 등

const storeListStore = useStoreListStore();

// 드롭다운 열림 상태
const isOpen = ref(false);

// 매장 목록 (Pinia에서 가져옴)
const stores = computed(() => storeListStore.stores);

// 선택된 매장 (Pinia 상태)
const selectedStore = computed(() => storeListStore.selectedStore);

// 화면에 보여줄 선택 매장 이름
const selectedStoreName = computed(() => {
  return selectedStore.value?.storeName || "역삼점";
});

// 드롭다운 토글
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// hover 상태 (지금은 스타일에 안 쓰고 있지만 필요하면 확장 가능)
const isHovered = ref(false);
const hoverDropdown = (hover) => {
  isHovered.value = hover;
};

// 매장 선택
const selectStore = (store) => {
  storeListStore.selectStore(store.storeId); // Pinia 상태 변경
  isOpen.value = false; // 드롭다운 닫기
};

// 컴포넌트 마운트 시 매장 리스트 불러오기
onMounted(async () => {
  await storeListStore.fetchStoreList();

  // 아직 선택된 매장이 없으면 기본값으로 역삼점 또는 첫 번째 매장 선택
  if (!storeListStore.selectedStore && storeListStore.stores.length > 0) {
    const defaultStore =
      storeListStore.stores.find((s) => s.storeName === "역삼점") ||
      storeListStore.stores[0];

    storeListStore.selectStore(defaultStore.storeId);
  }
});
</script>

<style scoped>
.store-select {
  width: 100%;
  border: none;
  position: relative;
  border-bottom: 2px solid #d9d9d9;
}

.dropdown {
  color: white;
  text-decoration: none;
  font-size: 15px;
  display: block;
  padding: 15px;
  margin: 10px 0;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-align: center;
}

.dropdown:hover {
  transform: scale(1.1);
  background-color: #ededed;
  color: #ff5e23;
  cursor: pointer;
}

.store-list {
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  justify-content: center;
}

.store-item {
  color: #ffd1a7;
  text-decoration: none;
  font-size: 15px;
  display: block;
  padding: 10px;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-align: center;
}

.store-item:hover {
  background-color: #ffd1a7;
  color: #ff4d4d;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
