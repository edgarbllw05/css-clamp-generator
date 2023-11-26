export const formFieldName = '.form__field-control'
export const formFields = document.querySelectorAll(formFieldName)
const minViewportWidthField = document.querySelector('#min-viewport')
const maxViewportWidthField = document.querySelector('#max-viewport')
const minValueField = document.querySelector('#min-value')
const maxValueField = document.querySelector('#max-value')
export const settingOptionName = '.setting-option'
export const settingOptions = document.querySelectorAll(settingOptionName)
export const storageKeyFormFields = 'form-fields'
export const storageKeySettings = 'settings'
const optionNestedCalc = document.querySelector('#option-nested-calc')
const optionFontSize = document.querySelector('#option-font-size')
export const outputText = document.querySelector('.output pre')
export const copyOutputButtonName = '[data-copy-output]'
const copyOutputButton = document.querySelector(copyOutputButtonName)
const checkFormulaButton = document.querySelector('[data-check-formula]')
export const resetInputsButtonName = '[data-reset-inputs]'
const resetInputsButton = document.querySelector(resetInputsButtonName)
const baseFontSize = 16
const decimalCount = 4
export const numberPattern = /^\d*$/
export const decimalPattern = /^\d*\.?\d*$/

export const sanitizeInput = (element, pattern) => {
	let previousValue = element.value

	element.addEventListener('input', () => {
		const sanitizedValue = element.value.replace(',', '.')
		element.value = sanitizedValue

		if (pattern.test(sanitizedValue)) {
			previousValue = element.value
			return
		}

		element.value = previousValue
	})
}

export const dataManager = {
	save: (key, value) => {
		localStorage.setItem(key, JSON.stringify(value))
	},
	load: key => {
		return JSON.parse(localStorage.getItem(key)) || {}
	}
}

export const formFieldsDataStorage = dataManager.load(storageKeyFormFields)
export const settingsDataStorage = dataManager.load(storageKeySettings)

const roundDecimals = (number, decimalCount) => {
	const value = number.toFixed(decimalCount)
	const trailingZeroesPattern = /\.?0+$/

	return value.replace(trailingZeroesPattern, '')
}

const removeLeadingZero = number => {
	const leadingZeroPattern = /^0\./
	const value = Math.abs(number).toString().replace(leadingZeroPattern, '.')

	return number < 0 ? `-${value}` : value
}

const formatValue = number => {
	const applyFunctions = [
		value => roundDecimals(value, decimalCount),
		removeLeadingZero
	]

	return applyFunctions.reduce((previousValue, currentFunction) => currentFunction(previousValue), number)
}

const calculateFormulaValues = (minViewportWidth, maxViewportWidth, minValue, maxValue) => {
	const minWidth = minViewportWidth / baseFontSize
	const maxWidth = maxViewportWidth / baseFontSize
	const slope = (maxValue - minValue) / (maxWidth - minWidth)
	const yAxisIntersection = -minWidth * slope + minValue
	const slopeMultiplied = slope * 100

	return {
		minValueCalculated: minValue,
		yAxisIntersectionCalculated: yAxisIntersection,
		slopeMultipliedCalculated: slopeMultiplied,
		maxValueCalculated: maxValue
	}
}

export const calculateFormula = () => {
	const minViewportWidth = parseInt(minViewportWidthField.value)
	const maxViewportWidth = parseInt(maxViewportWidthField.value)
	const minValue = parseFloat(minValueField.value)
	const maxValue = parseFloat(maxValueField.value)
	const {
		minValueCalculated,
		yAxisIntersectionCalculated,
		slopeMultipliedCalculated,
		maxValueCalculated
	} = calculateFormulaValues(minViewportWidth, maxViewportWidth, minValue, maxValue)
	const minValueFormatted = formatValue(minValueCalculated)
	const yAxisIntersectionFormatted = formatValue(yAxisIntersectionCalculated)
	const slopeMultipliedFormatted = formatValue(slopeMultipliedCalculated)
	const maxValueFormatted = formatValue(maxValueCalculated)
	const minValueDisplay = `${minValueFormatted}rem`
	let preferredValueDisplay = `${yAxisIntersectionFormatted}rem + ${slopeMultipliedFormatted}vw`
	const yAxisIntersectionNull = parseFloat(yAxisIntersectionFormatted) === 0
	const slopeNull = parseFloat(slopeMultipliedFormatted) === 0

	if (yAxisIntersectionNull) {
		preferredValueDisplay = `${slopeMultipliedFormatted}vw`
	}

	if (slopeNull) {
		preferredValueDisplay = `${yAxisIntersectionFormatted}rem`
	}

	const maxValueDisplay = `${maxValueFormatted}rem`
	let args = `${minValueDisplay}, ${preferredValueDisplay}, ${maxValueDisplay}`

	if (optionNestedCalc.checked) {
		if (!yAxisIntersectionNull && !slopeNull) {
			args = `${minValueDisplay}, calc(${preferredValueDisplay}), ${maxValueDisplay}`
		}
	}

	const formula = `clamp(${args})`
	let output = formula

	if (optionFontSize.checked) {
		output = `font-size: ${formula};`
	}

	const formulaValues = [
		minValueCalculated,
		yAxisIntersectionCalculated,
		slopeMultipliedCalculated,
		maxValueCalculated
	]
	const invalidOutput = formulaValues.some(value => {
		const isNotNumber = Number.isNaN(value)
		const isInfinite = !Number.isFinite(value)
		const isScientificNotation = value.toString().includes('e')

		if (isNotNumber || isInfinite) {
			output = 'Invalid values'
			return true
		}

		if (isScientificNotation) {
			output = 'Values too large'
			return true
		}
	})

	if (invalidOutput) {
		copyOutputButton.disabled = true
		checkFormulaButton.remove()
		settingOptions.forEach(option => {
			option.disabled = true
		})
	} else {
		copyOutputButton.disabled = false
		copyOutputButton.after(checkFormulaButton)
		settingOptions.forEach(option => {
			option.disabled = false
		})
	}

	outputText.innerText = output
}

export const updateCheckFormulaLink = () => {
	const minViewportWidth = parseInt(minViewportWidthField.value)
	const maxViewportWidth = parseInt(maxViewportWidthField.value)
	const minValue = parseFloat(minValueField.value)
	const maxValue = parseFloat(maxValueField.value)
	const {
		minValueCalculated,
		yAxisIntersectionCalculated,
		slopeMultipliedCalculated,
		maxValueCalculated
	} = calculateFormulaValues(minViewportWidth, maxViewportWidth, minValue, maxValue)
	const minValueFormatted = Math.round(minValueCalculated * baseFontSize)
	const yAxisIntersectionFormatted = roundDecimals(yAxisIntersectionCalculated, decimalCount)
	const slopeMultipliedFormatted = roundDecimals(slopeMultipliedCalculated, decimalCount)
	const maxValueFormatted = Math.round(maxValueCalculated * baseFontSize)
	const linkBase = 'https://modern-fluid-typography.vercel.app'
	const link = `${linkBase}/?minSize=${minValueFormatted}&relativeSize=${yAxisIntersectionFormatted}&fluidSize=${slopeMultipliedFormatted}&maxSize=${maxValueFormatted}`
	checkFormulaButton.href = link
}

export const formFieldsMutationObserver = () => {
	const dataChanged = [...formFields].some(field => {
		if (field.value === field.dataset.value) return
		return true
	})

	if (!dataChanged) {
		resetInputsButton.disabled = true
		return
	}

	resetInputsButton.disabled = false
}