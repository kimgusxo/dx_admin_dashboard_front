<!-- HomeApplianceList.vue -->
<template>
  <div class="appliance-list">
    <h1>가전 리스트</h1>

    <div v-if="isLoading" class="loading-text">
      데이터를 로드 중입니다...
    </div>
    <div v-else-if="error" class="error-text">
      {{ error }}
    </div>
    <div v-else class="appliance-list-table">
      <table>
        <thead>
          <tr>
            <th style="width: 260px;">이름</th>
            <th>모델명</th>
            <th>분류</th>
            <!-- <th>상태</th> -->
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="appliance in appliances"
            :key="appliance.id"
            class="row"
          >
            <td>{{ appliance.name }}</td>
            <td>{{ appliance.model }}</td>
            <td>{{ appliance.category }}</td>
            <!-- <td>{{ appliance.status }}</td> -->
          </tr>
          <tr v-if="!appliances.length">
            <td colspan="3" class="empty-text">
              등록된 가전이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useHomeApplianceStore } from "@/store/homeApplianceStore";

const props = defineProps({
  storeId: {
    type: Number,
    default: 1,
  },
});

const homeApplianceStore = useHomeApplianceStore();

const appliances = computed(() => homeApplianceStore.appliances);
const isLoading = computed(() => homeApplianceStore.isLoadingAppliances);
const error = computed(() => homeApplianceStore.appliancesError);

onMounted(async () => {
  await homeApplianceStore.fetchAppliances(props.storeId);
});
</script>

<style scoped>
.appliance-list {
  width: 600px;
  height: 680px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 20px;
  overflow: hidden;
}

.appliance-list-table {
  max-height: 85%;
  overflow-x: hidden;
  overflow-y: auto;
}

h1 {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  border-radius: 8px;
  background-color: #FFD1A7;
  padding: 20px;
  margin-top: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #FFF7EF;
}

thead th {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: left;
  border-bottom: 2px solid #eee;
  padding: 15px;
}

tbody td {
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding: 15px;
}

.row:hover {
  transform: scale(1.02);
}

.row {
  transition: transform 0.2s ease-in-out;
}

.loading-text,
.error-text,
.empty-text {
  text-align: center;
  font-size: 14px;
  margin-top: 20px;
}

.loading-text {
  color: #666;
}

.error-text {
  color: red;
}

.empty-text {
  color: #999;
}
</style>
