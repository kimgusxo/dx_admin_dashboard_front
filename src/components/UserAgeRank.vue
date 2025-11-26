<template>
  <div class="preference-table-wrapper" v-if="!isLoading">
    <h3>연령별 선호 밀키트</h3>
    <table>
      <thead>
        <tr>
          <th>연령</th>
          <th>선호 밀키트</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(mealKit, age) in topMealKitsByAge"
          :key="age"
          class="row"
        >
          <td>{{ age }}</td>
          <td>{{ mealKit ? mealKit.mealKitName : "없음" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else>
    <p>로딩 중...</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useUserStore } from "@/store/userStore";

const props = defineProps({
  storeId: {
    type: Number,
    default: 1,
  },
});

const userStore = useUserStore();

const topMealKitsByAge = computed(() => userStore.topMealKitsByAge);
const isLoading = computed(() => userStore.isLoading);

const fetchPreferences = async () => {
  await userStore.fetchTopMealKitsByAge(props.storeId);
};

onMounted(fetchPreferences);
</script>

<style scoped>
.preference-table-wrapper {
  width: 330px;
  height: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 20px;
}

h3 {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  border-radius: 8px;
  background-color: #FFD1A7;
  padding: 20px;
  margin-top: 0px;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

th {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  text-align: center;
  border-bottom: 2px solid #eee;
  padding: 10px;
}

td {
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
  cursor: default;
}
</style>
