<template>
  <div class="meal-kit-container">
    <!-- 밀키트 선택 Select Box -->
    <div class="meal-kit-select">
      <label for="mealKitSelect">밀키트를 선택하세요:</label>
      <select id="mealKitSelect" v-model="selectedMealKitId">
        <option
          v-for="mealKit in mealKits"
          :key="mealKit.mealKitId"
          :value="mealKit.mealKitId"
        >
          {{ mealKit.mealKitName }}
        </option>
      </select>
    </div>

    <!-- 차트 -->
    <div class="meal-kit-chart">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { Chart } from "chart.js";
import { useMealKitStore } from "@/store/mealKitStore";

// props: 매장 / 연도 선택 가능하게
const props = defineProps({
  storeId: {
    type: Number,
    default: 1,
  },
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
});

const mealKitStore = useMealKitStore();

// 차트용 데이터: mealKitSalesData 사용
const mealKits = computed(() => mealKitStore.mealKitSalesData);

// 선택된 밀키트 ID
const selectedMealKitId = ref(null);

// 선택된 밀키트 객체
const selectedMealKit = computed(() =>
  mealKits.value.find(
    (mealKit) => mealKit.mealKitId === selectedMealKitId.value
  )
);

const chartInstance = ref(null);
const chartCanvas = ref(null);

// Y축 최댓값 계산
const maxSalesValue = computed(() => {
  const all = mealKits.value.flatMap(
    (mealKit) => mealKit.monthlyMealKitSales || []
  );
  if (!all.length) return 0;
  return Math.max(...all);
});

// 차트 생성 및 업데이트
const renderChart = (mealKit) => {
  if (!mealKit) return;

  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = null;
  }

  if (!chartCanvas.value) {
    console.warn("Chart canvas is not available for rendering.");
    return;
  }

  const ctx = chartCanvas.value.getContext("2d");
  const maxSales = maxSalesValue.value || 10;
  const stepSize = Math.ceil(maxSales / 10) || 1;
  const yMax = Math.ceil(maxSales / stepSize) * stepSize || stepSize;

  chartInstance.value = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
      ],
      datasets: [
        {
          label: `${mealKit.mealKitName} 월별 판매량`,
          data: mealKit.monthlyMealKitSales,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          max: yMax,
          ticks: {
            stepSize,
          },
        },
      },
    },
  });
};

// 데이터 로드 후 기본 선택 세팅
watch(
  mealKits,
  (list) => {
    if (list.length && !selectedMealKitId.value) {
      selectedMealKitId.value = list[0].mealKitId;
    }
  },
  { immediate: true }
);

// 선택된 밀키트가 바뀔 때마다 차트 업데이트
watch(
  selectedMealKit,
  (newMealKit) => {
    if (newMealKit) {
      renderChart(newMealKit);
    }
  }
);

// 초기 데이터 + 차트 렌더링
onMounted(async () => {
  if (!mealKits.value.length) {
    await mealKitStore.fetchMealKitSalesData(props.storeId, props.year);
  }

  if (mealKits.value.length && !selectedMealKitId.value) {
    selectedMealKitId.value = mealKits.value[0].mealKitId;
  }

  if (selectedMealKit.value) {
    renderChart(selectedMealKit.value);
  }
});
</script>

<style scoped>
.meal-kit-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 600px;
  height: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 20px;
}

.meal-kit-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.meal-kit-select label {
  font-size: 16px;
  font-weight: bold;
}

.meal-kit-select select {
  padding: 5px 10px;
  font-size: 14px;
}

.meal-kit-chart {
  width: 100%;
  max-width: 600px;
}

canvas {
  max-width: 550px;
  width: 100%;
  height: auto;
}
</style>
