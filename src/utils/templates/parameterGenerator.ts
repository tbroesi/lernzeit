
import { QuestionTemplate, TemplateParameter } from '../questionTemplates';

export interface ParameterGenerationResult {
  parameters: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

export class ParameterGenerator {
  
  static generateParameters(template: QuestionTemplate): ParameterGenerationResult {
    const maxAttempts = 200;
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      const params: Record<string, any> = {};
      const errors: string[] = [];
      let valid = true;

      // FIXED: Use Math.random() directly for better randomization
      const randomSeed = Math.random() * 1000000;
      const timeSeed = Date.now() % 1000000;
      const combinedSeed = (randomSeed + timeSeed + attempts * 137) % 1000000;
      
      // Generate all parameters first
      for (const param of template.parameters) {
        try {
          if (param.type === 'number' && param.range) {
            const [min, max] = param.range;
            // FIXED: Much better random number generation with wider ranges
            const range = max - min + 1;
            const randomValue = Math.floor(Math.random() * range) + min;
            params[param.name] = randomValue;
            
          } else if (param.type === 'word' && param.values) {
            // FIXED: Better word selection with true randomization
            const index = Math.floor(Math.random() * param.values.length);
            params[param.name] = param.values[index];
            
          } else if (param.type === 'list' && param.values) {
            // FIXED: Create a shuffled copy of the values
            const shuffled = [...param.values].sort(() => Math.random() - 0.5);
            params[param.name] = shuffled;
          } else {
            errors.push(`Invalid parameter configuration for ${param.name}: missing range/values`);
            valid = false;
            break;
          }
        } catch (error) {
          errors.push(`Error generating parameter ${param.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          valid = false;
          break;
        }
      }

      // If basic generation failed, continue to next attempt
      if (!valid) {
        continue;
      }

      // Check all constraints after all parameters are generated
      let constraintsPassed = true;
      for (const param of template.parameters) {
        if (param.constraints && !param.constraints(params[param.name], params)) {
          constraintsPassed = false;
          break;
        }
      }

      // If all constraints passed, return the parameters
      if (constraintsPassed) {
        console.log(`✅ Generated parameters after ${attempts} attempts for ${template.id}:`, params);
        return {
          parameters: params,
          isValid: true,
          errors: []
        };
      }

      // If constraints failed, try again with new parameters
      console.log(`⚠️ Constraint check failed on attempt ${attempts} for ${template.id}, retrying...`);
    }

    // If we've exhausted all attempts
    console.error(`❌ Failed to generate valid parameters for template ${template.id} after ${maxAttempts} attempts`);
    return {
      parameters: {},
      isValid: false,
      errors: [`Failed to generate valid parameters after ${maxAttempts} attempts`]
    };
  }

  // FIXED: Add collision detection for generated combinations
  static generateUniqueParameters(
    template: QuestionTemplate, 
    usedCombinations: Set<string>
  ): ParameterGenerationResult {
    const maxAttempts = 300;
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      const result = this.generateParameters(template);
      
      if (!result.isValid) {
        continue;
      }

      // Create a unique key for this parameter combination
      const combinationKey = `${template.id}_${JSON.stringify(result.parameters)}`;
      
      if (!usedCombinations.has(combinationKey)) {
        console.log(`🎯 Generated unique combination: ${combinationKey}`);
        return result;
      }

      console.log(`🔄 Duplicate detected, retrying... (${attempts}/${maxAttempts})`);
    }

    // If we can't generate unique parameters, clear some combinations and try again
    console.warn(`⚠️ Could not generate unique parameters, allowing duplicates`);
    return this.generateParameters(template);
  }

  static validateParameter(param: TemplateParameter, value: any, allParams: Record<string, any>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Type validation
    if (param.type === 'number') {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`Parameter ${param.name} must be a valid number`);
      } else if (param.range) {
        const [min, max] = param.range;
        if (value < min || value > max) {
          errors.push(`Parameter ${param.name} must be between ${min} and ${max}`);
        }
      }
    } else if (param.type === 'word') {
      if (typeof value !== 'string' || value.length === 0) {
        errors.push(`Parameter ${param.name} must be a non-empty string`);
      } else if (param.values && !param.values.includes(value)) {
        errors.push(`Parameter ${param.name} must be one of: ${param.values.join(', ')}`);
      }
    } else if (param.type === 'list') {
      if (!Array.isArray(value)) {
        errors.push(`Parameter ${param.name} must be an array`);
      }
    }

    // Custom constraints
    if (param.constraints && !param.constraints(value, allParams)) {
      errors.push(`Parameter ${param.name} fails custom validation`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
