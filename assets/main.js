import {
	formFieldName,
	formFields,
	settingOptionName,
	settingOptions,
	storageKeyFormFields,
	storageKeySettings,
	outputText,
	copyOutputButtonName,
	resetInputsButtonName,
	numberPattern,
	decimalPattern,
	sanitizeInput,
	dataManager,
	formFieldsDataStorage,
	settingsDataStorage,
	calculateFormula,
	updateCheckFormulaLink,
	formFieldsMutationObserver
} from './utils.js'


/* #region Sanitize inputs */
document.addEventListener('beforeinput', e => {
	const numberInput = e.target.closest('[inputmode="numeric"]')
	const decimalInput = e.target.closest('[inputmode="decimal"]')

	if (numberInput) {
		sanitizeInput(numberInput, numberPattern)
	}

	if (decimalInput) {
		sanitizeInput(decimalInput, decimalPattern)
	}
})
/* #endregion Sanitize inputs */


/* #region Local storage */
formFields.forEach(field => {
	field.value = formFieldsDataStorage[field.id] ?? field.value
})

settingOptions.forEach(option => {
	option.checked = settingsDataStorage[option.id] ?? option.checked
})

document.addEventListener('input', e => {
	const formField = e.target.closest(formFieldName)
	const settingOption = e.target.closest(settingOptionName)

	if (formField) {
		formFieldsDataStorage[formField.id] = formField.value
		dataManager.save(storageKeyFormFields, formFieldsDataStorage)
	}

	if (settingOption) {
		settingsDataStorage[settingOption.id] = settingOption.checked
		dataManager.save(storageKeySettings, settingsDataStorage)
	}
})
/* #endregion Local storage */


/* #region Calculate formula */
calculateFormula()

document.addEventListener('input', e => {
	if (!e.target.closest(`${formFieldName}, ${settingOptionName}`)) return

	calculateFormula()
})
/* #endregion Calculate formula */


/* #region Output actions */
/* #region Copy output */
document.addEventListener('click', async e => {
	if (!e.target.closest(copyOutputButtonName)) return

	await navigator.clipboard.writeText(outputText.innerText)
})
/* #endregion Copy output */


/* #region Check formula */
updateCheckFormulaLink()

document.addEventListener('input', e => {
	if (!e.target.closest(formFieldName)) return

	updateCheckFormulaLink()
})
/* #endregion Check formula */


/* #region Reset inputs */
formFieldsMutationObserver()

document.addEventListener('input', e => {
	if (!e.target.closest(formFieldName)) return

	formFieldsMutationObserver()
})

document.addEventListener('click', e => {
	if (!e.target.closest(resetInputsButtonName)) return

	localStorage.removeItem(storageKeyFormFields)
	formFields.forEach(field => {
		field.value = field.dataset.value
	})

	formFieldsMutationObserver()
	calculateFormula()
	updateCheckFormulaLink()
})
/* #endregion Reset inputs */
/* #endregion Output actions */


console.log('%cGitHub repo: https://edgarbollow.com/go/github/repos/css-clamp-generator/', 'font-size: .875rem;')