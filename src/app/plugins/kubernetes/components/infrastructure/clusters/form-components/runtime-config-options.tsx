export default function() {
  return (
    <>
      {/* Advanced API Configuration */}
      <PicklistField
        id="runtimeConfigOption"
        label="Advanced API Configuration"
        options={runtimeConfigOptions}
        info="Make sure you are familiar with the Kubernetes API configuration documentation before enabling this option."
        required
      />

      {values.runtimeConfigOption === 'custom' && (
        <TextField id="customRuntimeConfig" label="Custom API Configuration" info="" />
      )}
    </>
  )
}
