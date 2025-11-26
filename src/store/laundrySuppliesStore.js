import { defineStore } from "pinia";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8081";

export const useLaundrySuppliesStore = defineStore("laundrySuppliesStore", {
  state: () => ({
    items: [],                 // 전체 세탁용품
    lowStockLaundrySupplies: [], // 재고 적은 세탁용품
    monthlyRank: [],           // 월별 판매량 TOP5
    yearlyRank: [],            // 연간 판매량 TOP5
    isLoading: false,
    error: null,
  }),

  getters: {
    // (필요하면) storeId로 필터링할 수도 있음
    suppliesByStore: (state) => (storeId) =>
      state.items.filter((item) => item.storeId === storeId),
  },

  actions: {
    // 매장별 세탁용품 리스트
    async fetchLaundrySupplies(storeId) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get("/laundrySupplies", {
          params: { storeId },
        });

        this.items = data;
        // 프론트 기준 임계값 (예: 30개 미만)
        this.lowStockLaundrySupplies = this.items.filter(
          (supply) => supply.storeCount < 30
        );
      } catch (err) {
        console.error("Error fetching laundry supplies:", err);
        this.error = "세탁용품 데이터를 불러오는 데 실패했습니다.";
      } finally {
        this.isLoading = false;
      }
    },

    // 백엔드에서 10개 미만만 주는 API를 그대로 쓰고 싶을 때
    async fetchLowStockFromServer(storeId) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get("/laundrySupplies/less10", {
          params: { storeId },
        });
        this.lowStockLaundrySupplies = data;
      } catch (err) {
        console.error("Error fetching low stock supplies:", err);
        this.error = "저재고 세탁용품 데이터를 불러오는 데 실패했습니다.";
      } finally {
        this.isLoading = false;
      }
    },

    // 월별 판매량 TOP5
    async fetchMonthlyRank(storeId, year, month) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get(
          "/laundrySupplies/top5/month/count",
          {
            params: { storeId, year, month },
          }
        );

        if (!data || data.length === 0) {
          this.monthlyRank = [];
          this.error = `${year}년 ${month}월의 세탁용품 판매량 데이터가 없습니다.`;
        } else {
          this.monthlyRank = data
            .slice() // 방어적 복사
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 5);
        }
      } catch (err) {
        console.error(err);
        this.error = "월별 판매량 랭킹 데이터를 불러오는 데 실패했습니다.";
        this.monthlyRank = [];
      } finally {
        this.isLoading = false;
      }
    },

    // 연간 판매량 TOP5
    async fetchYearlyRank(storeId, year) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get(
          "/laundrySupplies/top5/year/count",
          {
            params: { storeId, year },
          }
        );

        if (!data || data.length === 0) {
          this.yearlyRank = [];
          this.error = `${year}년 세탁용품 판매량 데이터가 없습니다.`;
        } else {
          this.yearlyRank = data
            .slice()
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 5);
        }
      } catch (err) {
        console.error(err);
        this.error = "연간 판매량 랭킹 데이터를 불러오는 데 실패했습니다.";
        this.yearlyRank = [];
      } finally {
        this.isLoading = false;
      }
    },
  },
});
