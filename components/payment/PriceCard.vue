<template>
  <div class="price-card" :class="{ 'price-card--featured': isFeatured }">
    <!-- 推荐标签 -->
    <div v-if="badge" class="price-card__badge">
      {{ badge }}
    </div>

    <!-- 卡片头部 -->
    <div class="price-card__header">
      <h3 class="price-card__title">{{ plan.name }}</h3>
      <div class="price-card__price">
        <span class="price-card__currency">{{ currency }}</span>
        <span class="price-card__amount">{{ plan.price }}</span>
        <span v-if="showPeriod" class="price-card__period">/{{ periodText }}</span>
      </div>
      <p v-if="description" class="price-card__description">{{ description }}</p>
    </div>

    <!-- 功能列表 -->
    <div class="price-card__features">
      <div
        v-for="(feature, index) in plan.features"
        :key="index"
        class="price-card__feature"
      >
        <span class="price-card__feature-icon">✓</span>
        <span>{{ feature }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="price-card__actions">
      <button
        @click="handleSelectPlan"
        :disabled="loading || isCurrentPlan"
        class="price-card__button"
        :class="{
          'price-card__button--loading': loading,
          'price-card__button--current': isCurrentPlan
        }"
      >
        <span v-if="loading" class="price-card__button-spinner"></span>
        <span v-else-if="isCurrentPlan">当前计划</span>
        <span v-else>{{ buttonText }}</span>
      </button>
    </div>

    <!-- 额外信息 -->
    <div v-if="extraInfo" class="price-card__extra">
      <small>{{ extraInfo }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  plan: {
    type: Object,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  period: {
    type: String,
    default: 'month'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  badge: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  extraInfo: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  isCurrentPlan: {
    type: Boolean,
    default: false
  },
  showPeriod: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['select'])

// 计算属性
const periodText = computed(() => {
  const periods = {
    month: '月',
    year: '年',
    lifetime: '终身'
  }
  return periods[props.period] || props.period
})

const buttonText = computed(() => {
  if (props.plan.type === 'lifetime') {
    return '一次性购买'
  }
  return `选择${periodText.value}计划`
})

// 方法
const handleSelectPlan = () => {
  if (!props.loading && !props.isCurrentPlan) {
    emit('select', props.plan)
  }
}
</script>

<style scoped>
.price-card {
  @apply relative bg-white rounded-lg border-2 border-gray-200 p-6 transition-all duration-300 hover:shadow-lg;
}

.price-card--featured {
  @apply border-primary-500 shadow-lg transform scale-105;
}

.price-card__badge {
  @apply absolute -top-3 right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium;
}

.price-card__header {
  @apply text-center mb-6;
}

.price-card__title {
  @apply text-xl font-bold text-gray-900 mb-2;
}

.price-card__price {
  @apply flex items-baseline justify-center mb-2;
}

.price-card__currency {
  @apply text-lg text-gray-600 mr-1;
}

.price-card__amount {
  @apply text-4xl font-bold text-gray-900;
}

.price-card__period {
  @apply text-lg text-gray-600 ml-1;
}

.price-card__description {
  @apply text-gray-600 text-sm;
}

.price-card__features {
  @apply mb-6 space-y-3;
}

.price-card__feature {
  @apply flex items-start;
}

.price-card__feature-icon {
  @apply text-green-500 mr-2 mt-0.5 flex-shrink-0;
}

.price-card__actions {
  @apply mb-4;
}

.price-card__button {
  @apply w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center;
}

.price-card__button:hover:not(:disabled) {
  @apply bg-primary-700;
}

.price-card__button:disabled {
  @apply bg-gray-300 cursor-not-allowed;
}

.price-card__button--current {
  @apply bg-green-600;
}

.price-card__button--loading {
  @apply opacity-75 cursor-wait;
}

.price-card__button-spinner {
  @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2;
}

.price-card__extra {
  @apply text-center text-gray-500 text-xs;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .price-card {
    @apply p-4;
  }

  .price-card__amount {
    @apply text-3xl;
  }

  .price-card--featured {
    @apply transform-none;
  }
}
</style>