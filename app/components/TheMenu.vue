<script setup lang="ts">
    const emit = defineEmits<{(e: 'select'): void}>()
    const route = useRoute()

    const menuOptions = [
    {
        label: 'Create',
        key: '/',
    },
    {
        label: 'Restore',
        key: '/resotre',
        disabled: true,
    },
    {
        label: 'Check',
        key: '/check',
        disabled: true,
    },
    ]
</script>
<template>
    <div class="flex gap-x-2">
        <nuxt-link
          v-for="option in menuOptions" 
          :key="option.key" 
          :to="option.disabled ? '' : option.key" 
          class="border p-1 rounded"
          :class="{'bg-gray-700 text-white': route.path === option.key, 'text-gray-500 cursor-not-allowed': option.disabled}" 
        >
            {{ option.label }}
        </nuxt-link>
    </div>
</template>