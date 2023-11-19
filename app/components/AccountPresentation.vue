<script setup lang="ts">
import { NCollapseItem, NButton } from 'naive-ui'
import { ref, watch, watchEffect } from 'vue'
import { format } from 'date-fns'
import { printCertificatePdf } from '../helpers/generatePdfs'
import { jsPDF } from 'jspdf'

const props = defineProps<{
  archivedPartsCount?: number
  archivedPartsThreshold?: number
  accountGenerationDate?: Date
  accountAddress?: string
  accountBalances?: { chain: string; balance: number; lockedAt: string | undefined }[]
}>()

const downloadedAt = ref<number | null>(null)
const isGenerating = ref(false)
const isDownloading = ref(false)
const certificatePdf = ref<jsPDF | null>(null)

watchEffect(async () => {
  if (
    props.accountAddress &&
    props.archivedPartsCount &&
    props.archivedPartsThreshold &&
    props.accountGenerationDate &&
    // currently we assume there is only one balance information
    props.accountBalances?.[0].balance
  ) {
    isGenerating.value = true
    certificatePdf.value = printCertificatePdf(
      props.accountAddress,
      props.accountBalances[0].balance,
      props.archivedPartsCount,
      props.archivedPartsThreshold,
      props.accountGenerationDate
    )
    await new Promise(resolve => setTimeout(resolve, 700))
    isGenerating.value = false
  }
})

const downloadPdf = async () => {
  if (!certificatePdf.value) {
    console.error('Do not have sufficient information to generate pdf cerificate.')
    return
  }
  isDownloading.value = true
  certificatePdf.value.save(`certificate-${props.accountAddress?.substring(0, 15)}.pdf`)
  await new Promise(resolve => setTimeout(resolve, 700))
  isDownloading.value = false
  downloadedAt.value = new Date().getTime()
}

watch(
  () => [props.archivedPartsCount, props.archivedPartsThreshold],
  ([newArchivedPartsCount, oldArchivedPartsCount], [newArchivedPartsThreshold, oldArchivedPartsThreshold]) => {
    if (newArchivedPartsCount !== oldArchivedPartsCount || newArchivedPartsThreshold !== oldArchivedPartsThreshold) {
      downloadedAt.value = null
    }
  }
)
</script>
<template>
  <n-collapse-item name="presentation">
    <template #header>
      <img src="~/assets/icons/head-crown.svg" class="w-6 h-6 mt-1" />
      <h4 class="ml-2 font-semibold">Print certificate</h4>
    </template>
    <div class="flex flex-col gap-y-5 py-1">
      <div>Print your account certificate and keep it safe.</div>
      <div class="flex gap-2 items-center">
        <n-button
          :type="downloadedAt ? 'default' : 'primary'"
          :loading="isGenerating || isDownloading"
          :disabled="!certificatePdf"
          @click="downloadPdf"
        >
          Download account certificate
        </n-button>
        <div v-if="downloadedAt" class="text-gray-400 flex items-center">Downloaded at {{ format(downloadedAt, 'HH:mm dd.MM.yyyy') }}</div>
      </div>
    </div>
  </n-collapse-item>
</template>
