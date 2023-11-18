<script setup lang="ts">
import { NCollapseItem, NIcon, NInputNumber, NButton } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { Print as PrintIcon } from '@vicons/ionicons5'
import { format } from 'date-fns'

const props = defineProps<{
  accountPrivateKey: string
  accountGenerationDate: Date
}>()

const emits = defineEmits<{
  (e: 'generated', archivedPartsCount: number, archivedPartsThreshold: number): void
  (e: 'updateConfirmed', isConfirmed: boolean): void
}>()

const archivedPartsCount = ref(0)
const archivedPartsThreshold = ref(0)
const downloadParts: Ref<{ index: number; downloadedAt: Date | null }[]> = ref([])
const currentIndexToGenerate: Ref<number | null> = ref(null)
const isGenerating = ref(false)

watch(
  [archivedPartsCount, archivedPartsThreshold],
  ([newArchivedPartsCount, oldArchivedPartsCount], [newArchivedPartsThreshold, oldArchivedPartsThreshold]) => {
    if (newArchivedPartsCount !== oldArchivedPartsCount || newArchivedPartsThreshold !== oldArchivedPartsThreshold) {
      downloadParts.value = Array.from({ length: archivedPartsCount.value }, (_, index) => ({
        index,
        downloadedAt: null,
      }))
      emits('updateConfirmed', false)
    }
  }
)

watch(downloadParts, downloadParts => {
  const isConfirmed = downloadParts.every(({ downloadedAt }) => downloadedAt !== null)
  emits('updateConfirmed', isConfirmed)
})

const title = computed(() => 'Preserve wallet')

const generatePdf = async (index: number) => {
  currentIndexToGenerate.value = index
  isGenerating.value = true
  await new Promise(() => {
    setTimeout(() => {
      currentIndexToGenerate.value = null
      isGenerating.value = false
      downloadParts.value[index].downloadedAt = new Date()
    }, 3000)
  })
}
</script>
<template>
  <n-collapse-item name="1">
    <template #header>
      <n-icon><print-icon /></n-icon>&nbsp;
      <h4 class="font-semibold">{{ title }}</h4>
    </template>
    <div class="flex flex-col gap-y-2">
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus nec ullamcorper eros, sed tincidunt erat. Proin congue leo eget
        lacinia suscipit. Duis felis lorem, molestie non nulla at, eleifend tristique justo. Nulla vitae libero eget est consectetur mattis
        nec at nisi. Pellentesque hendrerit elementum ultricies. Nunc ac scelerisque nunc. Maecenas mattis blandit ante, vel tristique ipsum
        semper vitae. Etiam at tincidunt est. Nullam ut enim pretium, pellentesque sapien ac, scelerisque nunc.
      </div>
      <div class="flex w-full gap-x-2">
        <div>
          <span class="font-semibold">Number of parts: </span>
          <n-input-number v-model:value="archivedPartsCount" clearable />
        </div>
        <div>
          <span class="font-semibold">Minimun number to restore: </span>
          <n-input-number v-model:value="archivedPartsThreshold" clearable />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div v-for="{ index, downloadedAt } of downloadParts" :key="index" class="flex gap-x-2">
          <n-button
            :type="downloadedAt ? 'default' : 'primary'"
            :loading="isGenerating && index === currentIndexToGenerate"
            @click="generatePdf(index)"
          >
            Download shared secret {{ index + 1 }} / {{ downloadParts.length }}
          </n-button>
          <span v-if="downloadedAt" class="text-gray-400">Downloaded at {{ format(downloadedAt, 'hh:mm MM/dd/yyyy') }}</span>
        </div>
      </div>
    </div>
  </n-collapse-item>
</template>
