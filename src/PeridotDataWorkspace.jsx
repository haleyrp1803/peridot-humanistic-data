/*
 * Data workspace entry. The editorial sample collection replaces the retired
 * introductory Data landing screen. App.jsx still owns uploads, staged source,
 * sample activation, mapping editors, and active research data.
 *
 * Staged sources receive a small contextual review panel; there is no second
 * sample chooser or implicit dataset activation.
 */
import React from 'react';
import { PeridotSampleSelectionPage } from './PeridotSampleSelectionPage';

export function PeridotDataWorkspace({
  peridotFileLabel,
  columnMappingStaging,
  activeMappedDataSource,
  handleDownloadPeridotTemplate,
  handleColumnMappingTableUpload,
  openColumnMappingModal,
  openActiveMappedDataEditor,
  clearColumnMappingStaging,
  sampleDatasets = [],
  onExploreSample,
  onEditSampleMapping,
  sampleLoadingId = '',
  activeSampleDataSource = null,
}) {
  return (
    <PeridotSampleSelectionPage
      sampleDatasets={sampleDatasets}
      sampleLoadingId={sampleLoadingId}
      onExploreSample={onExploreSample}
      onEditSampleMapping={onEditSampleMapping}
      onDownloadTemplate={handleDownloadPeridotTemplate}
      onUploadData={handleColumnMappingTableUpload}
      activeSourceLabel={peridotFileLabel}
      onEditActiveMapping={activeSampleDataSource
        ? () => onEditSampleMapping?.(activeSampleDataSource.sampleDatasetId)
        : activeMappedDataSource ? openActiveMappedDataEditor : null}
      staging={columnMappingStaging}
      onContinueStaging={openColumnMappingModal}
      onClearStaging={clearColumnMappingStaging}
    />
  );
}
