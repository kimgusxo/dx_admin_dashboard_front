import { defineStore } from "pinia";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8081";

export const useMealKitStore = defineStore("mealKitStore", {
  state: () => ({
    items: [],             // 전체 밀키트 리스트
    lowStockMealKits: [],  // 재고가 적은 밀키트
    cart: [],              // 장바구니
    selectedStoreId: null,

    // 통계/차트용
    mealKitSalesData: [],  // [{ mealKitId, mealKitName, monthlyMealKitSales: [12개] }]
    monthlyRank: [],       // 월별 판매량 TOP5
    monthlyRevenueRank: [],// 월별 매출액 TOP5
    yearlyRank: [],        // 연간 판매량 TOP5

    isLoading: false,
    error: null,
  }),

  getters: {
    selectedMealKits(state) {
      if (!state.selectedStoreId) return state.items;
      return state.items.filter((k) => k.storeId === state.selectedStoreId);
    },
    cartItems(state) {
      return state.cart;
    },
  },

  actions: {
    selectStore(storeId) {
      this.selectedStoreId = storeId;
    },

    // 매장별 밀키트 리스트
    async fetchMealKits(storeId) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get("/mealKits", {
          params: { storeId },
        });

        this.items = data;
        this.selectedStoreId = storeId;

        // 재고 20개 미만
        this.lowStockMealKits = this.items.filter(
          (kit) => kit.mealKitCount < 20
        );
      } catch (err) {
        console.error("Error fetching meal kits:", err);
        this.error = "밀키트 데이터를 불러오는 데 실패했습니다.";
      } finally {
        this.isLoading = false;
      }
    },

    // 서버에서 저재고(10 미만 등)를 따로 주는 API를 쓰고 싶을 때
    async fetchLowStockFromServer(storeId) {
      this.isLoading = true;
      this.error = null;
      try {
        const { data } = await axios.get("/mealKits/less10", {
          params: { storeId },
        });
        this.lowStockMealKits = data;
      } catch (err) {
        console.error(err);
        this.error = "저재고 밀키트 데이터를 불러오는 데 실패했습니다.";
      } finally {
        this.isLoading = false;
      }
    },

    // 장바구니
    addToCart(mealKitId) {
      const mealKit = this.items.find((kit) => kit.mealKitId === mealKitId);
      if (!mealKit) return;

      const existing = this.cart.find((item) => item.id === mealKitId);
      if (existing) {
        existing.quantity += 1;
      } else {
        this.cart.push({
          id: mealKit.mealKitId,
          name: mealKit.mealKitName,
          price: mealKit.mealKitPrice,
          stock: mealKit.mealKitCount,
          quantity: 1,
        });
      }
    },
    removeFromCart(id) {
      this.cart = this.cart.filter((item) => item.id !== id);
    },
    clearCart() {
      this.cart = [];
    },

    // 밀키트별 월별 판매량 (차트용)
    async fetchMealKitSalesData(storeId, year) {
      this.isLoading = true;
      this.error = null;

      try {
        // 1. 밀키트 리스트
        const { data: kits } = await axios.get("/mealKits", {
          params: { storeId },
        });

        const mealKits = kits.map((kit) => ({
          mealKitId: kit.mealKitId,
          mealKitName: kit.mealKitName,
          monthlyMealKitSales: Array(12).fill(0),
        }));

        // 2. 각 밀키트 월별 판매량
        for (const mealKit of mealKits) {
          const { data: sales } = await axios.get(
            "/mealKits/month/count",
            {
              params: {
                mealKitId: mealKit.mealKitId,
                storeId,
                year,
              },
            }
          );

          sales.forEach((item) => {
            const index = item.month - 1;
            if (index >= 0 && index < 12) {
              mealKit.monthlyMealKitSales[index] = item.salesCount;
            }
          });
        }

        this.mealKitSalesData = mealKits;
      } catch (err) {
        console.error(err);
        this.error = "밀키트 월별 판매량 데이터를 불러오는 데 실패했습니다.";
        this.mealKitSalesData = [];
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
          "/mealKits/top5/month/count",
          { params: { storeId, year, month } }
        );

        if (!data || data.length === 0) {
          this.monthlyRank = [];
          this.error = `${year}년 ${month}월의 밀키트 판매량 데이터가 없습니다.`;
        } else {
          this.monthlyRank = data
            .slice()
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 5);
        }
      } catch (err) {
        console.error(err);
        this.error = "월별 밀키트 판매량 랭킹 데이터를 불러오는 데 실패했습니다.";
        this.monthlyRank = [];
      } finally {
        this.isLoading = false;
      }
    },

    // 월별 매출 TOP5
    async fetchMonthlyRevenueRank(storeId, year, month) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get(
          "/mealKits/top5/month/revenue",
          { params: { storeId, year, month } }
        );

        if (!data || data.length === 0) {
          this.monthlyRevenueRank = [];
          this.error = `${year}년 ${month}월의 매출 데이터가 없습니다.`;
        } else {
          this.monthlyRevenueRank = data
            .slice()
            .sort((a, b) => b.monthlyTotalRevenue - a.monthlyTotalRevenue)
            .slice(0, 5);
        }
      } catch (err) {
        console.error(err);
        this.error = "월별 밀키트 매출 랭킹 데이터를 불러오는 데 실패했습니다.";
        this.monthlyRevenueRank = [];
      } finally {
        this.isLoading = false;
      }
    },

    // 전체 기간 / 연도별 TOP5
    async fetchYearlyRank(storeId, year) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get(
          "/mealKits/top5/year/count",
          { params: { storeId, year } }
        );

        if (!data || data.length === 0) {
          this.yearlyRank = [];
          this.error = `${year}년 밀키트 판매량 데이터가 없습니다.`;
        } else {
          this.yearlyRank = data
            .slice()
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 5);
        }
      } catch (err) {
        console.error(err);
        this.error = "연간 밀키트 판매량 랭킹 데이터를 불러오는 데 실패했습니다.";
        this.yearlyRank = [];
      } finally {
        this.isLoading = false;
      }
    },
  },
});
