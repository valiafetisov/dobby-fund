<script setup lang="ts">
import { NCollapseItem, NIcon, NInputNumber, NButton } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { format } from 'date-fns'
import { Buffer } from 'buffer'
import { split } from 'shamirs-secret-sharing-ts'
import { printHocruxPdf } from '../helpers/generatePdfs'
import { jsPDF } from 'jspdf'

/**
 * To resolve `Uncaught (in promise) ReferenceError: Buffer is not defined`
 * source: https://stackoverflow.com/a/71953677
 * @ts-ignore
 */
window.Buffer = Buffer
const props = defineProps<{
  accountAddress?: string
  accountPrivateKey?: string
  accountGenerationDate?: Date
}>()

const emits = defineEmits<{
  (e: 'generated', archivedPartsCount: number, archivedPartsThreshold: number): void
  (e: 'updateConfirmed', isConfirmed: boolean): void
}>()

const archivedPartsCount = ref(3)
const archivedPartsThreshold = ref(2)

const generatePDFs = async () => {
  if (!(props.accountPrivateKey && props.accountAddress && props.accountGenerationDate)) {
    return []
  }
  isGenerating.value = true
  const sharedSecrets: string[] = split(Buffer.from(props.accountPrivateKey), {
    shares: archivedPartsCount.value,
    threshold: archivedPartsThreshold.value,
  }).map((secret: any) => Buffer.from(secret).toString('hex'))

  const pdfs = printHocruxPdf(
    sharedSecrets,
    props.accountAddress,
    props.accountGenerationDate,
    archivedPartsCount.value,
    archivedPartsThreshold.value
  )

  const pdfsWithDownloadedAt = pdfs.map(pdf => ({
    pdf,
    downloadedAt: null,
  }))

  await new Promise(resolve => setTimeout(resolve, 700))

  isGenerating.value = false
  emits('generated', archivedPartsCount.value, archivedPartsThreshold.value)
  return pdfsWithDownloadedAt
}

const generatedPdfs = ref<{ pdf: jsPDF; downloadedAt: number | null }[]>([])
const currentIndexToGenerate: Ref<number | null> = ref(null)
const isDownloading = ref(false)
const isGenerating = ref(false)

watch(
  [archivedPartsCount, archivedPartsThreshold],
  async ([newArchivedPartsCount, oldArchivedPartsCount], [newArchivedPartsThreshold, oldArchivedPartsThreshold]) => {
    if (newArchivedPartsCount !== oldArchivedPartsCount || newArchivedPartsThreshold !== oldArchivedPartsThreshold) {
      generatedPdfs.value = await generatePDFs()
    }
  }
)

watch(
  () => props.accountPrivateKey,
  async (newPrivateKey, oldPrivateKey) => {
    if (newPrivateKey !== oldPrivateKey) {
      generatedPdfs.value = await generatePDFs()
    }
  }
)

const isConfirmed = computed(() => {
  return generatedPdfs.value?.length ? generatedPdfs.value.every(({ downloadedAt }) => downloadedAt !== null) : false
})

watch(isConfirmed, isConfirmed => {
  emits('updateConfirmed', isConfirmed)
})

const title = computed(() => (isConfirmed.value ? `Account is preserved via ${archivedPartsCount.value} shared secrets` : 'Preserve account'))

const updateDownloadState = async (index: number) => {
  if (!generatedPdfs.value) {
    return
  }

  currentIndexToGenerate.value = index
  isDownloading.value = true

  if (!generatedPdfs.value[index]) {
    return
  }
  generatedPdfs.value[index].pdf.save(`secret-${index + 1}.pdf`)
  await new Promise(resolve => setTimeout(resolve, 700))
  isDownloading.value = false
  currentIndexToGenerate.value = null
  generatedPdfs.value[index].downloadedAt = new Date().getTime()
}
</script>
<template>
  <n-collapse-item name="archive">
    <template #header>
      <img src="~/assets/icons/head-owl.svg" class="w-6 h-6 mt-1" />
      <h4 class="ml-2 font-semibold">{{ title }}</h4>
    </template>
    <div class="flex flex-col gap-y-5 py-1">
      <div>
        Create shared secrets to safely access your funds in the future. Specify the number of shared secrets and the minimum number of
        secrets that will be required to reconstruct your account access.
      </div>
      <div class="flex w-full gap-x-5 justify-stretch flex-1">
        <div class="w-full">
          <span class="font-semibold">Number of parts: </span>
          <n-input-number v-model:value="archivedPartsCount" :min="3" :disabled="!accountPrivateKey" />
        </div>
        <div class="w-full">
          <span class="font-semibold">Minimun number to restore: </span>
          <n-input-number v-model:value="archivedPartsThreshold" :min="2" :max="archivedPartsCount" :disabled="!accountPrivateKey" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div v-if="!generatedPdfs?.length" class="flex flex-col gap-2">
          <div v-for="index in archivedPartsCount" :key="`${index}-archivedPartsCount`" class="flex gap-x-12">
            <n-button type="info" disabled class="flex-1 flex-shrink-0">
              Download shared secret {{ index }} / {{ archivedPartsCount }}
            </n-button>
            <div class="flex-1 flex-shrink-0"></div>
          </div>
        </div>
        <div v-for="({ downloadedAt }, index) of generatedPdfs" :key="index" class="flex gap-x-5 items-center">
          <n-button
            class="w-full flex-1"
            :type="downloadedAt ? 'default' : 'info'"
            :secondary="!!downloadedAt"
            :loading="isGenerating || (isDownloading && index === currentIndexToGenerate)"
            @click="updateDownloadState(index)"
          >
            Download shared secret {{ index + 1 }} / {{ generatedPdfs ? generatedPdfs.length : 0 }}
          </n-button>
          <div class="text-gray-400 flex-1">
            <span v-if="downloadedAt">Downloaded at {{ format(downloadedAt, 'HH:mm dd.MM.yyyy') }}</span>
          </div>
        </div>
      </div>
    </div>
  </n-collapse-item>
</template>
