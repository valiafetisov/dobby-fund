<script setup lang="ts">
import { NCollapseItem, NIcon, NInputNumber, NButton } from 'naive-ui'
import { computed, ref, watch, watchEffect } from 'vue'
import type { Ref } from 'vue'
import { Print as PrintIcon } from '@vicons/ionicons5'
import { format } from 'date-fns'
import { Buffer } from 'buffer'
import { split } from 'shamirs-secret-sharing-ts'

/**
 * To resolve `Uncaught (in promise) ReferenceError: Buffer is not defined`
 * source: https://stackoverflow.com/a/71953677
 * @ts-ignore
 */
window.Buffer = Buffer
const props = defineProps<{
  accountPrivateKey: string
  accountGenerationDate?: Date
}>()

const emits = defineEmits<{
  (e: 'generated', archivedPartsCount: number, archivedPartsThreshold: number): void
  (e: 'updateConfirmed', isConfirmed: boolean): void
}>()

const archivedPartsCount = ref(3)
const archivedPartsThreshold = ref(2)

const generateDownloadParts = () => {
  if (!props.accountPrivateKey) {
    return []
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
const isDownloading = ref(false)

watch(
  [archivedPartsCount, archivedPartsThreshold],
  ([newArchivedPartsCount, oldArchivedPartsCount], [newArchivedPartsThreshold, oldArchivedPartsThreshold]) => {
    if (newArchivedPartsCount !== oldArchivedPartsCount || newArchivedPartsThreshold !== oldArchivedPartsThreshold) {
      downloadParts.value = generateDownloadParts()
    }
  }
)

watch(
  () => props.accountPrivateKey,
  (newPrivateKey, oldPrivateKey) => {
    if (newPrivateKey !== oldPrivateKey) {
      downloadParts.value = generateDownloadParts()
    }
  }
)

const isConfirmed = computed(() => {
  return downloadParts.value?.length ? downloadParts.value.every(({ downloadedAt }) => downloadedAt !== null) : false
})

watch(isConfirmed, isConfirmed => {
  emits('updateConfirmed', isConfirmed)
})

const title = computed(() => (isConfirmed.value ? `Wallet is preserved via ${archivedPartsCount.value} shared secrets` : 'Preserve wallet'))

const updateDownloadState = async (index: number) => {
  if (!downloadParts.value) {
    return
  }

  currentIndexToGenerate.value = index
  isDownloading.value = true

  setTimeout(() => {
    if (!downloadParts.value) {
      return
    }
    currentIndexToGenerate.value = null
    isDownloading.value = false
    downloadParts.value[index].downloadedAt = new Date().getTime()
  }, 750)
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
          <n-input-number v-model:value="archivedPartsCount" :min="3" :disabled="!accountPrivateKey" />
        </div>
        <div class="w-full">
          <span class="font-semibold">Minimun number to restore: </span>
          <n-input-number v-model:value="archivedPartsThreshold" :min="2" :max="archivedPartsCount" :disabled="!accountPrivateKey" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div v-if="!downloadParts?.length" class="flex flex-col gap-2">
          <div v-for="index in archivedPartsCount" class="flex gap-x-12">
            <n-button type="info" disabled class="flex-1 flex-shrink-0">
              Download shared secret {{ index }} / {{ archivedPartsCount }}
            </n-button>
            <div class="flex-1 flex-shrink-0"></div>
          </div>
        </div>
        <div v-for="{ index, sharedSecret, downloadedAt } of downloadParts" :key="index" class="flex gap-x-5 items-center">
          <a :href="generateTextFile(sharedSecret)" download class="block flex-1">
            <n-button
              class="w-full"
              :type="downloadedAt ? 'default' : 'info'"
              :secondary="!!downloadedAt"
              :loading="isDownloading && index === currentIndexToGenerate"
              @click="updateDownloadState(index)"
            >
              Download shared secret {{ index + 1 }} / {{ downloadParts ? downloadParts.length : 0 }}
            </n-button>
          </a>
          <div class="text-gray-400 flex-1">
            <span v-if="downloadedAt">Downloaded at {{ format(downloadedAt, 'HH:mm dd.MM.yyyy') }}</span>
          </div>
        </div>
      </div>
    </div>
  </n-collapse-item>
</template>
