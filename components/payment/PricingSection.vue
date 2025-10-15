<template>
  <section class="pricing-section">
    <div class="pricing-section__container">
      <!-- 标题区域 -->
      <div class="pricing-section__header">
        <h2 class="pricing-section__title">选择适合您的计划</h2>
        <p class="pricing-section__description">
          解锁所有高级功能，提升您的工作效率
        </p>
      </div>

      <!-- 价格周期切换 -->
      <div class="pricing-section__billing-toggle">
        <div class="pricing-section__toggle-group">
          <button
            @click="setBillingPeriod('monthly')"
            :class="{ 'pricing-section__toggle-button--active': billingPeriod === 'monthly' }"
            class="pricing-section__toggle-button"
          >
            月付
          </button>
          <button
            @click="setBillingPeriod('yearly')"
            :class="{ 'pricing-section__toggle-button--active': billingPeriod === 'yearly' }"
            class="pricing-section__toggle-button"
          >
            年付
            <span class="pricing-section__toggle-badge">省33%</span>
          </button>
        </div>
      </div>

      <!-- 价格卡片 -->
      <div class="pricing-section__cards">
        <PriceCard
          v-for="(plan, planId) in displayPlans"
          :key="planId"
          :plan="plan"
          :currency="currency"
          :period="billingPeriod"
          :is-featured="planId === 'yearly'"
          :badge="plan.badge"
          :loading="loadingPlan === planId"
          :is-current-plan="paymentStore.subscription.planId === planId"
          @select="handlePlanSelect"
        />
      </div>

      <!-- 功能对比 -->
      <div class="pricing-section__comparison">
        <h3 class="pricing-section__comparison-title">功能对比</h3>
        <div class="pricing-section__comparison-table">
          <!-- 表头 -->
          <div class="pricing-section__comparison-header">
            <div class="pricing-section__comparison-cell pricing-section__comparison-cell--feature">功能</div>
            <div class="pricing-section__comparison-cell">免费版</div>
            <div class="pricing-section__comparison-cell pricing-section__comparison-cell--pro">Pro 版</div>
          </div>

          <!-- 功能行 -->
          <div
            v-for="(feature, index) in comparisonFeatures"
            :key="index"
            class="pricing-section__comparison-row"
          >
            <div class="pricing-section__comparison-cell pricing-section__comparison-cell--feature">
              {{ feature.name }}
            </div>
            <div class="pricing-section__comparison-cell">
              <span v-if="feature.free === true" class="pricing-section__check">✓</span>
              <span v-else-if="feature.free === false" class="pricing-section__cross">✗</span>
              <span v-else class="pricing-section__limited">{{ feature.free }}</span>
            </div>
            <div class="pricing-section__comparison-cell pricing-section__comparison-cell--pro">
              <span v-if="feature.pro === true" class="pricing-section__check">✓</span>
              <span v-else-if="feature.pro === false" class="pricing-section__cross">✗</span>
              <span v-else class="pricing-section__unlimited">{{ feature.pro }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 常见问题 -->
      <div class="pricing-section__faq">
        <h3 class="pricing-section__faq-title">常见问题</h3>
        <div class="pricing-section__faq-items">
          <div
            v-for="(faq, index) in faqItems"
            :key="index"
            class="pricing-section__faq-item"
          >
            <button
              @click="toggleFaq(index)"
              class="pricing-section__faq-question"
            >
              <span>{{ faq.question }}</span>
              <svg
                class="pricing-section__faq-icon"
                :class="{ 'pricing-section__faq-icon--open': expandedFaq === index }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-show="expandedFaq === index"
              class="pricing-section__faq-answer"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- 信任标识 -->
      <div class="pricing-section__trust">
        <div class="pricing-section__trust-item">
          <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>30天退款保证</span>
        </div>
        <div class="pricing-section__trust-item">
          <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>安全加密支付</span>
        </div>
        <div class="pricing-section__trust-item">
          <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>随时取消订阅</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import PriceCard from '~/components/payment/PriceCard.vue'

const paymentStore = usePaymentStore()
const { pricingPlans } = usePayment()

// 响应式数据
const billingPeriod = ref('yearly')
const currency = ref('USD')
const loadingPlan = ref(null)
const expandedFaq = ref(null)

// 计算属性
const displayPlans = computed(() => {
  const plans = {}

  if (billingPeriod.value === 'monthly') {
    plans.monthly = { ...pricingPlans.monthly }
    plans.yearly = { ...pricingPlans.yearly }
  } else {
    plans.yearly = { ...pricingPlans.yearly }
    plans.lifetime = { ...pricingPlans.lifetime }
  }

  return plans
})

const comparisonFeatures = computed(() => [
  { name: '基础工具使用', free: '✓', pro: '✓' },
  { name: 'JSON 格式化', free: '✓', pro: '✓' },
  { name: 'Base64 编解码', free: '✓', pro: '✓' },
  { name: 'QR 码生成', free: '✓', pro: '✓' },
  { name: '高级 JSON 功能', free: '部分', pro: '完整' },
  { name: '批量处理', free: '✗', pro: '✓' },
  { name: '自定义主题', free: '✗', pro: '✓' },
  { name: '优先客服支持', free: '✗', pro: '✓' },
  { name: '广告移除', free: '✗', pro: '✓' },
  { name: '云端同步', free: '✗', pro: '✓' },
  { name: 'API 访问', free: '✗', pro: '✓' },
  { name: '团队协作', free: '✗', pro: '✓' }
])

const faqItems = computed(() => [
  {
    question: '支持哪些支付方式？',
    answer: '我们支持 Creem、PayPal 等多种支付方式，所有支付都是安全加密的。'
  },
  {
    question: '可以随时取消订阅吗？',
    answer: '是的，您可以随时取消订阅。取消后仍可使用到当前计费周期结束。'
  },
  {
    question: '有退款政策吗？',
    answer: '我们提供30天退款保证。如果您不满意，可以在购买后30天内申请全额退款。'
  },
  {
    question: '订阅后如何激活功能？',
    answer: '支付成功后，高级功能会立即自动激活，无需手动操作。'
  },
  {
    question: '可以更换订阅计划吗？',
    answer: '是的，您可以随时升级或降级您的订阅计划。'
  }
])

// 方法
const setBillingPeriod = (period) => {
  billingPeriod.value = period
}

const handlePlanSelect = async (plan) => {
  loadingPlan.value = plan.id

  try {
    await paymentStore.showSubscriptionPayment(plan.id)
  } catch (error) {
    console.error('选择计划失败:', error)
  } finally {
    loadingPlan.value = null
  }
}

const toggleFaq = (index) => {
  expandedFaq.value = expandedFaq.value === index ? null : index
}
</script>

<style scoped>
.pricing-section {
  @apply py-16 bg-gray-50;
}

.pricing-section__container {
  @apply container mx-auto px-6;
}

/* 标题区域 */
.pricing-section__header {
  @apply text-center mb-12;
}

.pricing-section__title {
  @apply text-3xl md:text-4xl font-bold text-gray-900 mb-4;
}

.pricing-section__description {
  @apply text-xl text-gray-600 max-w-2xl mx-auto;
}

/* 价格周期切换 */
.pricing-section__billing-toggle {
  @apply flex justify-center mb-12;
}

.pricing-section__toggle-group {
  @apply inline-flex bg-gray-100 rounded-lg p-1;
}

.pricing-section__toggle-button {
  @apply relative px-6 py-2 text-sm font-medium rounded-md transition-colors duration-200;
}

.pricing-section__toggle-button--active {
  @apply bg-white text-gray-900 shadow-sm;
}

.pricing-section__toggle-badge {
  @apply absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full;
}

/* 价格卡片 */
.pricing-section__cards {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16;
}

/* 功能对比 */
.pricing-section__comparison {
  @apply mb-16;
}

.pricing-section__comparison-title {
  @apply text-2xl font-bold text-center text-gray-900 mb-8;
}

.pricing-section__comparison-table {
  @apply max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden;
}

.pricing-section__comparison-header {
  @apply grid grid-cols-3 bg-gray-50 border-b border-gray-200;
}

.pricing-section__comparison-row {
  @apply grid grid-cols-3 border-b border-gray-100;
}

.pricing-section__comparison-row:last-child {
  @apply border-b-0;
}

.pricing-section__comparison-cell {
  @apply p-4 text-center;
}

.pricing-section__comparison-cell--feature {
  @apply text-left font-medium text-gray-900;
}

.pricing-section__comparison-cell--pro {
  @apply bg-primary-50 font-medium text-primary-900;
}

.pricing-section__check {
  @apply text-green-500 font-bold;
}

.pricing-section__cross {
  @apply text-red-500 font-bold;
}

.pricing-section__limited,
.pricing-section__unlimited {
  @apply text-gray-600;
}

/* 常见问题 */
.pricing-section__faq {
  @apply max-w-3xl mx-auto;
}

.pricing-section__faq-title {
  @apply text-2xl font-bold text-center text-gray-900 mb-8;
}

.pricing-section__faq-items {
  @apply space-y-4;
}

.pricing-section__faq-item {
  @apply bg-white rounded-lg shadow-md overflow-hidden;
}

.pricing-section__faq-question {
  @apply w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200;
}

.pricing-section__faq-icon {
  @apply w-5 h-5 text-gray-400 transition-transform duration-200;
}

.pricing-section__faq-icon--open {
  @apply rotate-180;
}

.pricing-section__faq-answer {
  @apply px-6 pb-4 text-gray-600;
}

/* 信任标识 */
.pricing-section__trust {
  @apply flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600;
}

.pricing-section__trust-item {
  @apply flex items-center space-x-2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pricing-section__cards {
    @apply grid-cols-1;
  }

  .pricing-section__comparison-header,
  .pricing-section__comparison-row {
    @apply grid-cols-1 text-left;
  }

  .pricing-section__comparison-cell {
    @apply border-b border-gray-100;
  }

  .pricing-section__comparison-cell--feature {
    @apply font-bold bg-gray-50;
  }

  .pricing-section__comparison-cell--pro {
    @apply bg-primary-50;
  }

  .pricing-section__trust {
    @apply flex-col gap-4;
  }
}
</style>