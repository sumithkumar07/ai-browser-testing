// 🖱️ INTERACTION SIMULATOR
// Simulates real user interactions with web pages

class InteractionSimulator {
  constructor() {
    this.clickStrategies = new Map();
    this.formFillingStrategies = new Map();
    this.scrollStrategies = new Map();
    this.initializeStrategies();
  }

  async initialize() {
    console.log('🖱️ Initializing Interaction Simulator...');
    this.initializeStrategies();
  }

  initializeStrategies() {
    // Click strategies for different element types
    this.clickStrategies.set('button', {
      waitForVisible: true,
      scrollToElement: true,
      hoverFirst: false,
      doubleClick: false
    });

    this.clickStrategies.set('link', {
      waitForVisible: true,
      scrollToElement: true,
      hoverFirst: true,
      doubleClick: false
    });

    this.clickStrategies.set('checkbox', {
      waitForVisible: true,
      scrollToElement: true,
      hoverFirst: false,
      doubleClick: false
    });

    // Form filling strategies
    this.formFillingStrategies.set('text', {
      clearFirst: true,
      typeSpeed: 50, // ms per character
      pressTab: true
    });

    this.formFillingStrategies.set('email', {
      clearFirst: true,
      typeSpeed: 40,
      validate: true,
      pressTab: true
    });

    this.formFillingStrategies.set('password', {
      clearFirst: true,
      typeSpeed: 60,
      secure: true,
      pressTab: true
    });
  }

  async clickElement(webContents, selector, options = {}) {
    try {
      console.log(`🖱️ Simulating click on: ${selector}`);

      // First, check if element exists and is clickable
      const elementInfo = await this.getElementInfo(webContents, selector);
      if (!elementInfo.exists) {
        throw new Error(`Element not found: ${selector}`);
      }

      if (!elementInfo.clickable) {
        throw new Error(`Element not clickable: ${selector}`);
      }

      // Apply click strategy based on element type
      const strategy = this.clickStrategies.get(elementInfo.type) || this.clickStrategies.get('button');
      
      // Scroll to element if needed
      if (strategy.scrollToElement) {
        await this.scrollToElement(webContents, selector);
        await this.delay(200);
      }

      // Hover first if strategy requires it
      if (strategy.hoverFirst) {
        await this.hoverElement(webContents, selector);
        await this.delay(100);
      }

      // Wait for element to be visible if needed
      if (strategy.waitForVisible) {
        await this.waitForElementVisible(webContents, selector);
      }

      // Perform the actual click
      const clickResult = await webContents.executeJavaScript(`
        (function() {
          try {
            const element = document.querySelector('${selector}');
            if (!element) return { success: false, error: 'Element not found' };
            
            // Create and dispatch click event
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            
            element.dispatchEvent(clickEvent);
            
            return { 
              success: true, 
              elementText: element.textContent?.trim() || '',
              elementType: element.tagName.toLowerCase(),
              clicked: true
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `);

      // Handle double click if strategy requires it
      if (strategy.doubleClick && clickResult.success) {
        await this.delay(50);
        await webContents.executeJavaScript(`
          document.querySelector('${selector}').dispatchEvent(new MouseEvent('dblclick', {
            bubbles: true,
            cancelable: true,
            view: window
          }))
        `);
      }

      console.log(`✅ Click successful: ${selector}`);
      return clickResult;

    } catch (error) {
      console.error(`❌ Click failed on ${selector}:`, error);
      return { success: false, error: error.message };
    }
  }

  async fillForm(webContents, formData, options = {}) {
    try {
      console.log(`📝 Filling form with ${Object.keys(formData).length} fields`);

      const results = {};

      for (const [fieldName, value] of Object.entries(formData)) {
        try {
          const fieldResult = await this.fillFormField(webContents, fieldName, value, options);
          results[fieldName] = fieldResult;
          
          // Small delay between fields
          await this.delay(200);
          
        } catch (fieldError) {
          console.warn(`⚠️ Failed to fill field ${fieldName}:`, fieldError);
          results[fieldName] = { success: false, error: fieldError.message };
        }
      }

      const successCount = Object.values(results).filter(r => r.success).length;
      console.log(`✅ Form filling completed: ${successCount}/${Object.keys(formData).length} fields successful`);

      return {
        success: successCount > 0,
        results,
        successCount,
        totalFields: Object.keys(formData).length
      };

    } catch (error) {
      console.error('❌ Form filling failed:', error);
      return { success: false, error: error.message };
    }
  }

  async fillFormField(webContents, fieldName, value, options = {}) {
    try {
      // Try different field selector strategies
      const selectors = [
        `[name="${fieldName}"]`,
        `[id="${fieldName}"]`,
        `[placeholder*="${fieldName}"]`,
        `input[type="text"][name*="${fieldName}"]`,
        `input[aria-label*="${fieldName}"]`
      ];

      let fieldSelector = null;
      let fieldInfo = null;

      // Find the field using different selectors
      for (const selector of selectors) {
        fieldInfo = await this.getElementInfo(webContents, selector);
        if (fieldInfo.exists) {
          fieldSelector = selector;
          break;
        }
      }

      if (!fieldSelector) {
        throw new Error(`Field not found: ${fieldName}`);
      }

      // Get field type for appropriate strategy
      const fieldType = fieldInfo.type || 'text';
      const strategy = this.formFillingStrategies.get(fieldType) || this.formFillingStrategies.get('text');

      // Scroll to field
      await this.scrollToElement(webContents, fieldSelector);
      await this.delay(100);

      // Focus on field
      await webContents.executeJavaScript(`
        document.querySelector('${fieldSelector}').focus()
      `);
      await this.delay(100);

      // Clear field if strategy requires it
      if (strategy.clearFirst) {
        await webContents.executeJavaScript(`
          const field = document.querySelector('${fieldSelector}');
          field.value = '';
          field.dispatchEvent(new Event('input', { bubbles: true }));
        `);
        await this.delay(100);
      }

      // Type the value with realistic speed
      if (strategy.typeSpeed && typeof value === 'string') {
        await this.typeText(webContents, fieldSelector, value, strategy.typeSpeed);
      } else {
        await webContents.executeJavaScript(`
          const field = document.querySelector('${fieldSelector}');
          field.value = '${value}';
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        `);
      }

      // Validate field if strategy requires it
      if (strategy.validate && fieldType === 'email') {
        const isValid = await this.validateEmail(webContents, fieldSelector);
        if (!isValid) {
          console.warn(`⚠️ Email validation failed for field: ${fieldName}`);
        }
      }

      // Press tab to move to next field if strategy requires it
      if (strategy.pressTab) {
        await webContents.executeJavaScript(`
          document.querySelector('${fieldSelector}').dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Tab',
            keyCode: 9,
            bubbles: true
          }))
        `);
      }

      console.log(`✅ Field filled: ${fieldName} = ${value}`);
      return { success: true, fieldName, value, selector: fieldSelector };

    } catch (error) {
      console.error(`❌ Failed to fill field ${fieldName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async typeText(webContents, selector, text, speed) {
    try {
      const characters = text.split('');
      
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        
        await webContents.executeJavaScript(`
          const field = document.querySelector('${selector}');
          const currentValue = field.value;
          field.value = currentValue + '${char}';
          field.dispatchEvent(new Event('input', { bubbles: true }));
        `);
        
        // Random delay to simulate human typing
        const delay = speed + Math.random() * 20 - 10;
        await this.delay(delay);
      }

      // Dispatch final change event
      await webContents.executeJavaScript(`
        document.querySelector('${selector}').dispatchEvent(new Event('change', { bubbles: true }))
      `);

    } catch (error) {
      throw new Error(`Failed to type text: ${error.message}`);
    }
  }

  async hoverElement(webContents, selector) {
    try {
      await webContents.executeJavaScript(`
        const element = document.querySelector('${selector}');
        if (element) {
          element.dispatchEvent(new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: true,
            view: window
          }));
        }
      `);
    } catch (error) {
      console.warn(`⚠️ Hover failed on ${selector}:`, error);
    }
  }

  async scrollToElement(webContents, selector) {
    try {
      await webContents.executeJavaScript(`
        const element = document.querySelector('${selector}');
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }
      `);
    } catch (error) {
      console.warn(`⚠️ Scroll failed to ${selector}:`, error);
    }
  }

  async getElementInfo(webContents, selector) {
    try {
      const info = await webContents.executeJavaScript(`
        (function() {
          const element = document.querySelector('${selector}');
          if (!element) return { exists: false };
          
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          
          return {
            exists: true,
            visible: style.display !== 'none' && style.visibility !== 'hidden',
            clickable: !element.disabled && style.pointerEvents !== 'none',
            type: element.type || element.tagName.toLowerCase(),
            text: element.textContent?.trim() || '',
            value: element.value || '',
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            attributes: {
              id: element.id,
              name: element.name,
              className: element.className,
              placeholder: element.placeholder
            }
          };
        })()
      `);

      return info;

    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  async waitForElementVisible(webContents, selector, timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const info = await this.getElementInfo(webContents, selector);
      if (info.exists && info.visible) {
        return true;
      }
      await this.delay(100);
    }
    
    throw new Error(`Element not visible within timeout: ${selector}`);
  }

  async validateEmail(webContents, selector) {
    try {
      const isValid = await webContents.executeJavaScript(`
        const field = document.querySelector('${selector}');
        const email = field.value;
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        emailRegex.test(email);
      `);

      return isValid;

    } catch (error) {
      return false;
    }
  }

  async simulateKeyPress(webContents, selector, key, options = {}) {
    try {
      await webContents.executeJavaScript(`
        const element = document.querySelector('${selector}');
        if (element) {
          element.dispatchEvent(new KeyboardEvent('keydown', {
            key: '${key}',
            bubbles: true,
            cancelable: true,
            ...${JSON.stringify(options)}
          }));
        }
      `);

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async simulateScroll(webContents, direction, amount = 300) {
    try {
      await webContents.executeJavaScript(`
        window.scrollBy(0, ${direction === 'down' ? amount : -amount});
      `);

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async waitForPageChange(webContents, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Page change timeout'));
      }, timeout);

      const onNavigation = () => {
        clearTimeout(timer);
        webContents.removeListener('did-finish-load', onNavigation);
        resolve();
      };

      webContents.once('did-finish-load', onNavigation);
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { InteractionSimulator };