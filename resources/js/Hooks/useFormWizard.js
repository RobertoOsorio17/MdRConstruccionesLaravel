/**
 * useFormWizard Hook
 * 
 * Hook personalizado para manejar formularios multi-paso (wizards).
 * Gestiona navegación entre pasos, validación, y estado del formulario.
 * 
 * Uso:
 * const wizard = useFormWizard({
 *   steps: ['basic', 'project', 'budget'],
 *   initialValues: { name: '', email: '', ... },
 *   onComplete: (values) => { ... }
 * });
 */

import { useState, useCallback } from 'react';

/**
 * Hook para manejar wizards multi-paso
 * @param {object} config - Configuración del wizard
 * @param {array} config.steps - Array de nombres de pasos
 * @param {object} config.initialValues - Valores iniciales del formulario
 * @param {function} config.onComplete - Callback al completar todos los pasos
 * @param {function} config.onStepChange - Callback al cambiar de paso
 * @param {boolean} config.allowSkip - Permitir saltar pasos
 * @returns {object} Estado y métodos del wizard
 */
export const useFormWizard = (config = {}) => {
    const {
        steps = [],
        initialValues = {},
        onComplete = null,
        onStepChange = null,
        allowSkip = false
    } = config;

    const [currentStep, setCurrentStep] = useState(0);
    const [formValues, setFormValues] = useState(initialValues);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Ir al siguiente paso
     */
    const nextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep);
            
            // Marcar paso actual como completado
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps([...completedSteps, currentStep]);
            }

            if (onStepChange) {
                onStepChange(newStep, steps[newStep]);
            }
        }
    }, [currentStep, steps, completedSteps, onStepChange]);

    /**
     * Ir al paso anterior
     */
    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            const newStep = currentStep - 1;
            setCurrentStep(newStep);

            if (onStepChange) {
                onStepChange(newStep, steps[newStep]);
            }
        }
    }, [currentStep, steps, onStepChange]);

    /**
     * Ir a un paso específico
     */
    const goToStep = useCallback((stepIndex) => {
        if (stepIndex >= 0 && stepIndex < steps.length) {
            // Si no se permite saltar, solo permitir ir a pasos completados o el siguiente
            if (!allowSkip && stepIndex > currentStep + 1) {
                return;
            }

            setCurrentStep(stepIndex);

            if (onStepChange) {
                onStepChange(stepIndex, steps[stepIndex]);
            }
        }
    }, [steps, currentStep, allowSkip, onStepChange]);

    /**
     * Actualizar valores del formulario
     */
    const updateFormValues = useCallback((newValues) => {
        setFormValues(prev => ({
            ...prev,
            ...newValues
        }));
    }, []);

    /**
     * Actualizar un campo específico
     */
    const updateField = useCallback((fieldName, value) => {
        setFormValues(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Limpiar error del campo si existe
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    }, [errors]);

    /**
     * Establecer errores de validación
     */
    const setFieldErrors = useCallback((newErrors) => {
        setErrors(newErrors);
    }, []);

    /**
     * Limpiar errores
     */
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    /**
     * Resetear wizard
     */
    const reset = useCallback(() => {
        setCurrentStep(0);
        setFormValues(initialValues);
        setCompletedSteps([]);
        setErrors({});
        setIsSubmitting(false);
    }, [initialValues]);

    /**
     * Completar wizard
     */
    const complete = useCallback(async () => {
        setIsSubmitting(true);

        try {
            if (onComplete) {
                await onComplete(formValues);
            }
            
            // Marcar último paso como completado
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps([...completedSteps, currentStep]);
            }

            return true;
        } catch (error) {
            console.error('Error completing wizard:', error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [formValues, currentStep, completedSteps, onComplete]);

    /**
     * Verificar si un paso está completado
     */
    const isStepCompleted = useCallback((stepIndex) => {
        return completedSteps.includes(stepIndex);
    }, [completedSteps]);

    /**
     * Verificar si es el primer paso
     */
    const isFirstStep = currentStep === 0;

    /**
     * Verificar si es el último paso
     */
    const isLastStep = currentStep === steps.length - 1;

    /**
     * Obtener progreso del wizard (0-100)
     */
    const progress = steps.length > 0 
        ? ((currentStep + 1) / steps.length) * 100 
        : 0;

    /**
     * Obtener nombre del paso actual
     */
    const currentStepName = steps[currentStep] || '';

    return {
        // Estado
        currentStep,
        currentStepName,
        formValues,
        errors,
        completedSteps,
        isSubmitting,
        isFirstStep,
        isLastStep,
        progress,
        totalSteps: steps.length,

        // Métodos de navegación
        nextStep,
        prevStep,
        goToStep,

        // Métodos de formulario
        updateFormValues,
        updateField,
        setFieldErrors,
        clearErrors,
        reset,
        complete,

        // Utilidades
        isStepCompleted
    };
};

/**
 * Hook para validación de paso
 * @param {object} values - Valores del formulario
 * @param {object} validationSchema - Schema de validación (Yup o custom)
 * @returns {object} { validate, errors, isValid }
 */
export const useStepValidation = (values, validationSchema) => {
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    const validate = useCallback(async () => {
        try {
            if (validationSchema && validationSchema.validate) {
                // Yup schema
                await validationSchema.validate(values, { abortEarly: false });
                setErrors({});
                setIsValid(true);
                return true;
            } else if (typeof validationSchema === 'function') {
                // Custom validation function
                const validationErrors = await validationSchema(values);
                if (Object.keys(validationErrors).length === 0) {
                    setErrors({});
                    setIsValid(true);
                    return true;
                } else {
                    setErrors(validationErrors);
                    setIsValid(false);
                    return false;
                }
            }
            
            // Sin validación
            setIsValid(true);
            return true;
        } catch (error) {
            if (error.inner) {
                // Yup validation errors
                const validationErrors = {};
                error.inner.forEach(err => {
                    validationErrors[err.path] = err.message;
                });
                setErrors(validationErrors);
            } else {
                setErrors({ general: error.message });
            }
            setIsValid(false);
            return false;
        }
    }, [values, validationSchema]);

    return { validate, errors, isValid };
};

export default useFormWizard;

