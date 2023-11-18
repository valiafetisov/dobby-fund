<script setup lang="ts">
import { NCollapseItem, NIcon, NInputNumber, NButton } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { Print as PrintIcon } from '@vicons/ionicons5'
import { format } from 'date-fns'
import { Buffer } from 'buffer'
import { split } from 'shamirs-secret-sharing-ts'

const props = defineProps<{
  accountPrivateKey: string
  accountGenerationDate: Date | undefined
}>()

const emits = defineEmits<{
  (e: 'generated', archivedPartsCount: number, archivedPartsThreshold: number): void
  (e: 'updateConfirmed', isConfirmed: boolean): void
}>()

const archivedPartsCount = ref(3)
const archivedPartsThreshold = ref(2)

const generateDownloadParts = () => {
  if (!props.accountPrivateKey) {
    return
  }

  const sharedSecrets: ArrayBuffer[] = split(Buffer.from(props.accountPrivateKey), {
    shares: archivedPartsCount.value,
    threshold: archivedPartsThreshold.value,
  })

  const downloadParts = sharedSecrets.map((secret, index) => ({
    index,
    sharedSecret: new Uint8Array(secret).toString(),
    downloadedAt: null,
  }))

  emits('generated', archivedPartsCount.value, archivedPartsThreshold.value)
  return downloadParts
}

const downloadParts: Ref<{ index: number; sharedSecret: string; downloadedAt: number | null }[] | undefined> = ref(generateDownloadParts())
const currentIndexToGenerate: Ref<number | null> = ref(null)
const isGenerating = ref(false)

watch(
  [archivedPartsCount, archivedPartsThreshold],
  ([newArchivedPartsCount, oldArchivedPartsCount], [newArchivedPartsThreshold, oldArchivedPartsThreshold]) => {
    if (newArchivedPartsCount !== oldArchivedPartsCount || newArchivedPartsThreshold !== oldArchivedPartsThreshold) {
      downloadParts.value = generateDownloadParts()
    }
  }
)

const isConfirmed = computed(() => {
  return downloadParts.value ? downloadParts.value.every(({ downloadedAt }) => downloadedAt !== null) : false
})

watch(isConfirmed, isConfirmed => {
  emits('updateConfirmed', isConfirmed)
})

const title = computed(() => (isConfirmed.value ? `Wallet is preserved via ${archivedPartsCount.value} shared secrets` : 'Preserve wallet'))

const generatePdf = async (index: number) => {
  if (!downloadParts.value) {
    return
  }
  currentIndexToGenerate.value = index
  isGenerating.value = true
  setTimeout(() => {
    if (!downloadParts.value) {
      return
    }
    currentIndexToGenerate.value = null
    isGenerating.value = false
    downloadParts.value[index].downloadedAt = new Date().getTime()
  }, 3000)
}

const generateTextFile = (value: string) => URL.createObjectURL(new Blob([value], { type: 'text/plain' }))
</script>
<template>
  <n-collapse-item name="archive">
    <template #header>
      <n-icon><print-icon /></n-icon>
      <h4 class="ml-2 font-semibold">{{ title }}</h4>
    </template>
    <div class="flex flex-col gap-y-5 py-1">
      <div>
        Create shared secrets to safely access your funds in the future. Specify the number of shared secrets and the minimum number of
        secrets that will be required to regenerate your secret key.
      </div>
      <div class="flex w-full gap-x-5 justify-stretch flex-1">
        <div class="w-full">
          <span class="font-semibold">Number of parts: </span>
          <n-input-number v-model:value="archivedPartsCount" :min="3" />
        </div>
        <div class="w-full">
          <span class="font-semibold">Minimun number to restore: </span>
          <n-input-number v-model:value="archivedPartsThreshold" :min="2" :max="archivedPartsCount" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div v-for="{ index, sharedSecret, downloadedAt } of downloadParts" :key="index" class="flex gap-x-2 items-center">
          <a :href="generateTextFile(sharedSecret)" download>
            <n-button
              :type="downloadedAt ? 'default' : 'primary'"
              :loading="isGenerating && index === currentIndexToGenerate"
              @click="generatePdf(index)"
            >
              Download shared secret {{ index + 1 }} / {{ downloadParts ? downloadParts.length : 0 }}
            </n-button>
          </a>
          <span v-if="downloadedAt" class="text-gray-400">Downloaded at {{ format(downloadedAt, 'hh:mm MM/dd/yyyy') }}</span>
        </div>
      </div>
    </div>
  </n-collapse-item>
</template>
