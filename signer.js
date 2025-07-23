function addNoCacheToFetch() {
    const originalFetch = window.fetch;
    window.fetch = function() {
        if (arguments[0] instanceof Request) {
            arguments[0] = new Request(arguments[0], {
                cache: 'no-store',
                headers: {
                    ...arguments[0].headers,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
        } else {
            if (typeof arguments[1] !== 'object') {
                arguments[1] = {};
            }
            if (!arguments[1].headers) {
                arguments[1].headers = {};
            }
            arguments[1].cache = 'no-store';
            arguments[1].headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            arguments[1].headers['Pragma'] = 'no-cache';
            arguments[1].headers['Expires'] = '0';
        }
        return originalFetch.apply(this, arguments);
    };
}

addNoCacheToFetch();

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("ASrequest");
    const resultDiv = document.getElementById("result");
    const loader = document.getElementById("loader");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const signInButton = document.getElementById("signInButton");
    const authPopup = document.getElementById("authPopup");
    const authForm = document.getElementById("authForm");
    const authTitle = document.getElementById("authTitle");
    const authSubmit = document.getElementById("authSubmit");
    const authToggle = document.getElementById("authToggle");
    const userInfo = document.getElementById("userInfo");
    const usernameDisplay = document.getElementById("username-display");
    const privacyPolicyAgreement = document.getElementById("privacyPolicyAgreement");
    const agreePrivacyPolicyCheckbox = document.getElementById("agreePrivacyPolicy");
    const viewPrivacyPolicyLink = document.getElementById("viewPrivacyPolicy");
    const maxFileSizeElement = document.getElementById('maxFileSize');
    const linkDurationInfo = document.getElementById('linkDuration');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const dropdownMenu = document.getElementById('dropdownMenu');

    let isLoginMode = false;
    let currentUser = null;

    togglePassword.addEventListener("click", function () {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });

    if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!currentUser) {
            showNotification("Please log in to sign IPAs", "error");
            return;
        }

        // Logging user and file info
        console.log("Signing request initiated by user:", currentUser.username);
        const ipaFile = document.getElementById('ipa').files[0];
        console.log("File selected for signing:", ipaFile ? ipaFile.name : "No file selected");

        const maxSize = currentUser.premium ? 1.5 * 1024 * 1024 * 1024 : 1024 * 1024 * 1024;

        if (ipaFile && ipaFile.size > maxSize) {
            showNotification(`File size exceeds the ${currentUser.premium ? '1.5 GB' : '1 GB'} limit. ${currentUser.premium ? '' : 'Upgrade to premium for larger files.'}`, "error");
            return;
        }

        // Cyan: Validate .cyan file type if provided
        const cyanConfigInput = document.getElementById('cyanConfig');
        if (cyanConfigInput && cyanConfigInput.files.length > 0) {
            const cyanFile = cyanConfigInput.files[0];
            if (!cyanFile.name.endsWith('.cyan')) {
                showNotification('Invalid file type for Cyan Config. Please select a .cyan file.', 'error');
                cyanConfigInput.value = '';
                return;
            }
        }

        // Build cyan flags from modifications
        let cyanFlags = [];
        
        // Bundle ID modification
        const modifyBundleId = document.getElementById('modifyBundleId');
        const newBundleId = document.getElementById('newBundleId');
        if (modifyBundleId && modifyBundleId.checked && newBundleId && newBundleId.value.trim()) {
            cyanFlags.push(`--bundle-id "${newBundleId.value.trim()}"`);
        }
        
        // App Name modification
        const modifyAppName = document.getElementById('modifyAppName');
        const newAppName = document.getElementById('newAppName');
        if (modifyAppName && modifyAppName.checked && newAppName && newAppName.value.trim()) {
            cyanFlags.push(`--name "${newAppName.value.trim()}"`);
        }
        
        // Version modification
        const modifyVersion = document.getElementById('modifyVersion');
        const newVersion = document.getElementById('newVersion');
        if (modifyVersion && modifyVersion.checked && newVersion && newVersion.value.trim()) {
            cyanFlags.push(`--version "${newVersion.value.trim()}"`);
        }
        
        // Minimum OS modification
        const modifyMinOS = document.getElementById('modifyMinOS');
        const newMinOS = document.getElementById('newMinOS');
        if (modifyMinOS && modifyMinOS.checked && newMinOS && newMinOS.value.trim()) {
            cyanFlags.push(`--min-os "${newMinOS.value.trim()}"`);
        }
        
        // Inject Dylib
        const injectDylib = document.getElementById('injectDylib');
        const dylibFile = document.getElementById('dylibFile');
        if (injectDylib && injectDylib.checked && dylibFile && dylibFile.files.length > 0) {
            cyanFlags.push(`--inject "${dylibFile.files[0].name}"`);
        }
        
        // Inject Deb
        const injectDeb = document.getElementById('injectDeb');
        const debFile = document.getElementById('debFile');
        if (injectDeb && injectDeb.checked && debFile && debFile.files.length > 0) {
            cyanFlags.push(`--inject "${debFile.files[0].name}"`);
        }
        
        // Remove Watch App
        const removeWatchApp = document.getElementById('removeWatchApp');
        if (removeWatchApp && removeWatchApp.checked) {
            cyanFlags.push('--remove-watch');
        }
        
        // Remove App Extensions
        const removeAppExtensions = document.getElementById('removeAppExtensions');
        if (removeAppExtensions && removeAppExtensions.checked) {
            cyanFlags.push('--remove-extensions');
        }
        
        // Thin to ARM64
        const thinARM64 = document.getElementById('thinARM64');
        if (thinARM64 && thinARM64.checked) {
            cyanFlags.push('--thin');
        }

        resultDiv.textContent = "";
        loader.classList.remove("hidden");

        const formData = new FormData(form);
        formData.append("isPremium", currentUser.premium ? 'true' : 'false');
        formData.append("expiryDays", currentUser.premium ? "120" : "30");
        formData.append("username", currentUser.username);

        // Cyan: Add cyanConfig file and cyanFlags to FormData if present
        if (cyanConfigInput && cyanConfigInput.files.length > 0) {
            formData.append('cyanConfig', cyanConfigInput.files[0]);
        }
        
        // Add modification files to FormData
        if (dylibFile && dylibFile.files.length > 0) {
            formData.append('dylibFile', dylibFile.files[0]);
        }
        if (debFile && debFile.files.length > 0) {
            formData.append('debFile', debFile.files[0]);
        }
        
        // Add cyan flags if any modifications are selected
        if (cyanFlags.length > 0) {
            formData.append('cyanFlags', cyanFlags.join(' '));
        }

        const button = form.querySelector('button[type="submit"]');
if (button) {
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;
} else {
    console.warn("Submit button not found in the form.");
}

        try {
            console.log("Sending signing request to API...");
            console.log("User premium status:", currentUser.premium);
            
            const response = await fetch("https://api.cherrysideloading.xyz/sign", {
                method: "POST",
                body: formData
            });

            console.log("Response received from API with status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Signing successful. API response:", result);
            handleSigningSuccess(result);
        } catch (error) {
            console.error("Error during signing request:", error);
            handleSigningError(error);
        } finally {
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign IPA';
            button.disabled = false;
        }
    });
}

function handleSigningSuccess(data) {
    loader.classList.add("hidden");
    console.log("Handling signing success. Data:", data);
    resultDiv.innerHTML = '';
    if (data.install_url) {
        const installLink = document.createElement("a");
        installLink.href = data.install_url;
        installLink.textContent = "Install App";
        installLink.className = "install-link";
        installLink.target = "_blank";
        resultDiv.appendChild(installLink);

        // Copy Link Button
        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-link-btn";
        copyBtn.textContent = "Copy Link";
        copyBtn.onclick = function() {
            navigator.clipboard.writeText(data.install_url).then(() => {
                showNotification("Link copied to clipboard!", "success");
            }, () => {
                showNotification("Failed to copy link.", "error");
            });
        };
        resultDiv.appendChild(copyBtn);

        showNotification("IPA signed successfully!", "success");
    } else {
        console.error("Failed to obtain install link from response data.");
        throw new Error("Unable to get the install link");
    }
}

    async function handleSigningError(error) {
        console.error("Signing process failed:", error);
        loader.classList.add("hidden");

        if (error.response) {
            if (error.response.status === 400) {
                error.response.json().then((data) => {
                    const errorMessage = data.error || "An error occurred. Please try again.";
                    resultDiv.textContent = `Error: ${errorMessage}`;
                    showNotification(errorMessage, "error");
                }).catch(() => {
                    resultDiv.textContent = "Error: Failed to sign. Please contact support.";
                    showNotification("Failed to sign. Please contact support.", "error");
                });
            } else {
                resultDiv.textContent = `Error: ${error.response.statusText || "An error occurred"}`;
                showNotification(`Error: ${error.response.statusText || "An error occurred"}`, "error");
            }
        } else {
            resultDiv.textContent = "An error occured while signing, P12 password may be incorrect.";
            showNotification("An error occured while signing, P12 password may be incorrect.", "error");
        }
    }

function handleRegistrationError(error) {
    console.error("Registration process failed:", error);

    loader.classList.add("hidden");

    // If error.response exists and it's a validation error (status 400)
    if (error.response && error.response.status === 400) {
        error.response.json().then((data) => {
            const errorMessage = data.error || "An error occurred. Please try again.";
            resultDiv.textContent = `Error: ${errorMessage}`;
            showNotification(errorMessage, "error");
        }).catch(() => {
            // In case parsing the error message fails
            resultDiv.textContent = "Error: Failed to register. Please contact support.";
            showNotification("Failed to register. Please contact support.", "error");
        });
    } else {
        // For any other kind of error (e.g., network error or unexpected server error)
        resultDiv.textContent = "Error: Internal server error. Please try again later.";
        showNotification("Internal server error", "error");
    }
}

    function showNotification(message, type) {
        const notification = document.createElement("div");
        notification.textContent = message;
        notification.className = `notification ${type}`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    const fileInputs = document.querySelectorAll('input[type="file"]');
    if (fileInputs.length > 0) {
        fileInputs.forEach((input) => {
            input.addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (file && !isValidFileType(file, input.id)) {
                    showNotification(
                        `Invalid file type for ${input.id}. Please select the correct file.`,
                        "error"
                    );
                    input.value = "";
            }
        });
    });
}

    function isValidFileType(file, inputId) {
        const validTypes = {
            p12: [".p12"],
            mobileprovision: [".mobileprovision"],
            ipa: [".ipa"],
        };
        const fileExtension = file.name.split(".").pop().toLowerCase();
        return validTypes[inputId].includes(`.${fileExtension}`);
    }

    if (signInButton) {
        signInButton.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentUser) {
                // Show sign-out confirmation
                if (confirm("Are you sure you want to sign out?")) {
                    currentUser = null;
                    localStorage.removeItem('currentUser');
                    checkLoginStatus();
                    showNotification("Signed out successfully", "success");
                }
            } else {
                if (authPopup) {
                    authPopup.classList.remove('hidden');
                    authPopup.style.display = 'block';
                } else {
                    console.error("Auth popup not found");
                }
            }
        });
    }

    if (authToggle) {
        authToggle.addEventListener("click", (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            authTitle.textContent = isLoginMode ? "Login" : "Sign Up";
            authSubmit.textContent = isLoginMode ? "Login" : "Sign Up";
            authToggle.innerHTML = isLoginMode ? 'Don\'t have an account? <a href="#">Sign Up</a>' : 'Already have an account? <a href="#">Login</a>';
            privacyPolicyAgreement.style.display = isLoginMode ? "none" : "block";
            agreePrivacyPolicyCheckbox.required = !isLoginMode;
        });
    }

    if (authForm) {
        authForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("auth-username").value;
            const password = document.getElementById("auth-password").value;

            if (!isLoginMode && !agreePrivacyPolicyCheckbox.checked) {
                showNotification("You must agree to the Privacy Policy to sign up.", "error");
                return;
            }

            if (isLoginMode) {
                const user = await db.loginUser(username, password);
                if (user) {
                    currentUser = {
                        username: user.username,
                        premium: user.premium, 
                        isDev: user.isDev
                    };
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    showNotification("Logged in successfully!", "success");
                    authPopup.classList.add('hidden');
                    checkLoginStatus();
                } else {
                    showNotification("Invalid username or password", "error");
                }
            } else {
                const success = await registerUser(username, password);
                if (success) {
                    showNotification("Account created successfully! You can now log in.", "success");
                    // The UI is already updated in the registerUser function
                }
            }
        });
    }

        async function registerUser(username, password) {
        try {
            console.log('Attempting register with:', username, password);
            const response = await fetch('https://admin.cherrysideloading.xyz/api.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', username, password }),
            });
            const data = await response.json();
console.log(data);
if (data.success) {
    showNotification('Registration successful. You can now log in.', 'success');
    // Instead of calling toggleAuthMode, we'll update the UI directly
    isLoginMode = true;
    authTitle.textContent = "Login";
    authSubmit.textContent = "Login";
    authToggle.innerHTML = 'Don\'t have an account? <a href="#">Sign Up</a>';
    privacyPolicyAgreement.style.display = "none";
    agreePrivacyPolicyCheckbox.required = false;
    return true;
} else {
    console.error('Registration failed:', data); // Logs the full error details
    showNotification(data.error || 'Registration failed. Please try again.', 'error');
    return false;
}Ï
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('An error occurred during registration. Please try again.', 'error');
            return false;
        }
    }

    function checkLoginStatus() {
        const storedUser = localStorage.getItem('currentUser');
        currentUser = storedUser ? JSON.parse(storedUser) : null;
        if (currentUser) {
            if (signInButton) signInButton.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
            if (userInfo) userInfo.classList.remove("hidden");
            if (usernameDisplay) {
                usernameDisplay.textContent = currentUser.username;
                if (currentUser.premium) {
                    usernameDisplay.innerHTML += ' <span class="premium-badge">Premium</span>';
                    linkDurationInfo.textContent = 'Links last for 4 months because you have premium';
                } else {
                    linkDurationInfo.textContent = 'Links last for 1 month';
                }
                if (currentUser.isDev) {
                    usernameDisplay.innerHTML += ' <span class="dev-badge">Dev</span>';
                }
            }
            const devButton = document.getElementById('devButton');
            if (currentUser.isDev && devButton) {
                devButton.classList.remove("hidden");
                devButton.addEventListener('click', toggleAdminPanel);
            } else if (devButton) {
                devButton.classList.add("hidden");
            }
        } else {
            if (signInButton) signInButton.innerHTML = '<i class="fas fa-sign-in-alt"></i>';
            if (userInfo) userInfo.classList.add("hidden");
            if (usernameDisplay) usernameDisplay.textContent = "";
            const devButton = document.getElementById('devButton');
            if (devButton) devButton.classList.add("hidden");
            linkDurationInfo.textContent = '';
        }
        // Dispatch a custom event when login status changes
        document.dispatchEvent(new Event('loginStatusChanged'));
        updateMaxFileSize();
    }

    function toggleAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) {
            console.error('Admin panel element not found');
            return;
        }
        console.log('Admin panel before toggle:', adminPanel.classList.contains('hidden'));
        adminPanel.classList.toggle('hidden');
        console.log('Admin panel after toggle:', adminPanel.classList.contains('hidden'));
        
        if (!adminPanel.classList.contains('hidden')) {
            console.log('Admin panel should be visible now');
            adminPanel.style.display = 'block'; // Force display
            loadUsers();
            addCloseButtonToAdminPanel();
        } else {
            console.log('Admin panel should be hidden now');
            adminPanel.style.display = 'none'; // Force hide
        }
    }

    function addCloseButtonToAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) return;

        let closeButton = adminPanel.querySelector('.close-button');
        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.className = 'close-button';
            closeButton.innerHTML = '&times;';
            closeButton.onclick = toggleAdminPanel;
            adminPanel.insertBefore(closeButton, adminPanel.firstChild);
        }
    }

    function checkAdminPanel() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const adminPanel = document.getElementById('adminPanel');
        const devButton = document.getElementById('devButton');

        console.log('Checking admin panel, current user:', currentUser);

        if (currentUser && currentUser.isDev) {
            if (devButton) {
                console.log('Dev button found, setting up click event');
                devButton.classList.remove('hidden');
                devButton.onclick = toggleAdminPanel;
            } else {
                console.error('Dev button not found in DOM');
            }
        } else {
            if (devButton) {
                devButton.classList.add('hidden');
            }
            if (adminPanel) {
                adminPanel.classList.add('hidden');
            }
        }
    }

    // Call this function when the page loads
    document.addEventListener('DOMContentLoaded', checkAdminPanel);

    document.getElementById('devButton').addEventListener('click', () => {
        const adminPanel = document.getElementById('adminPanel');
        adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
        if (adminPanel.style.display === 'block') {
            loadUsers();
        }
    });

    checkLoginStatus();

    document.querySelectorAll(".close").forEach((closeButton) => {
        closeButton.addEventListener("click", () => {
            closeButton.closest(".popup").classList.add('hidden');
        });
    });

    const fileButtons = document.querySelectorAll(".file-button");
    fileButtons.forEach((button) => {
        button.addEventListener("click", () => {
            button.previousElementSibling.click();
        });
    });

    fileInputs.forEach((input) => {
        input.addEventListener("change", (event) => {
            const fileName = event.target.files[0].name;
            const button = input.nextElementSibling;
            button.textContent = fileName;
        });
    });

    window.addEventListener("click", (e) => {
        if (e.target === authPopup) {
            authPopup.classList.add('hidden');
        }
    });

    function sanitizeInput(input) {
        return input.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    async function loginUser(username, password) {
        const sanitizedUsername = sanitizeInput(username);
        const user = await db.loginUser(sanitizedUsername, password);
        if (user) {
            currentUser = user;
            updateUIForLoggedInUser();
            closeAuthPopup();
            showNotification('Login successful!', 'success');
        } else {
            showNotification('Login failed. Please check your credentials.', 'error');
        }
    }

    function updateUIForUser(user) {
        const userInfo = document.getElementById('userInfo');
        const usernameDisplay = document.getElementById('username-display');
        const devButton = document.getElementById('devButton');
        const linkDurationInfo = document.getElementById('linkDuration');

        if (user) {
            userInfo.classList.remove('hidden');
            usernameDisplay.textContent = user.username;
            
            if (user.premium) {
                usernameDisplay.innerHTML += ' <span class="premium-badge">Premium</span>';
                linkDurationInfo.textContent = 'Links last for 2 months because you have premium';
            } else {
                linkDurationInfo.textContent = 'Links last for 14 days';
            }
            
            if (user.isDev) {
                usernameDisplay.innerHTML += ' <span class="dev-badge">DEV</span>';
                devButton.classList.remove('hidden');
                devButton.addEventListener('click', toggleAdminPanel);
            } else {
                devButton.classList.add('hidden');
                devButton.removeEventListener('click', toggleAdminPanel);
            }
        } else {
            userInfo.classList.add('hidden');
            devButton.classList.add('hidden');
            devButton.removeEventListener('click', toggleAdminPanel);
            linkDurationInfo.textContent = '';
        }
    }

    async function login(username, password) {
        const user = await db.loginUser(username, password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateUIForUser(user);
            closeAuthPopup();
            showNotification('Logged in successfully!', 'success');
        } else {
            showNotification('Invalid credentials', 'error');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        updateUIForUser(currentUser);
    });

    document.addEventListener('loginStatusChanged', () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        updateUIForUser(currentUser);
    });

    const toggleAuthPassword = document.getElementById("toggleAuthPassword");

/*if (toggleAuthPassword) {
    toggleAuthPassword.addEventListener("click", function() {
        const passwordInput = document.getElementById("auth-password");
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });
} else {
    console.warn("Element with ID 'toggleAuthPassword' not found in DOM.");
}*/

    function showPrivacyPolicy() {
        document.getElementById('authForm').classList.add('hidden');
        document.getElementById('privacyPolicyTab').classList.remove('hidden');
    }

    function hidePrivacyPolicy() {
        document.getElementById('authForm').classList.remove('hidden');
        document.getElementById('privacyPolicyTab').classList.add('hidden');
    }

    function togglePrivacyPolicyAgreement(show) {
        const agreementDiv = document.getElementById('privacyPolicyAgreement');
        if (show) {
            agreementDiv.classList.remove('hidden');
        } else {
            agreementDiv.classList.add('hidden');
        }
    }

    /*viewPrivacyPolicyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPrivacyPolicy();
    });*/

    const backToSignup = document.getElementById('backToSignup');
    if (backToSignup) {
        backToSignup.addEventListener('click', hidePrivacyPolicy);
    }

    function updateMaxFileSize() {
        if (currentUser && currentUser.premium) {
            maxFileSizeElement.textContent = '1.5 GB PREMIUM';
        } else {
            maxFileSizeElement.textContent = '1 GB';
        }
    }
    
    updateMaxFileSize();

    const closePopupBtn = document.querySelector('#authPopup .close');
    if (closePopupBtn && authPopup) {
        closePopupBtn.addEventListener('click', function() {
            authPopup.classList.add('hidden');
            authPopup.style.display = 'none';
        });
    }
    
    const modificationCheckboxes = document.querySelectorAll('.modification-checkbox');
    modificationCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const modificationItem = this.closest('.modification-item');
            const inputs = modificationItem.querySelectorAll('input:not(.modification-checkbox), button');
            
            inputs.forEach(input => {
                if (this.checked) {
                    input.disabled = false;
                    if (input.classList.contains('modification-input')) {
                        input.style.opacity = '1';
                    }
                } else {
                    input.disabled = true;
                    if (input.classList.contains('modification-input')) {
                        input.style.opacity = '0.5';
                    }
                }
            });
        });
    });
    
    const modificationFileBtns = document.querySelectorAll('.modification-file-btn');
    modificationFileBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const fileInput = this.previousElementSibling;
            if (fileInput && !fileInput.disabled) {
                fileInput.click();
            }
        });
    });
    
    const modificationFiles = document.querySelectorAll('.modification-file');
    modificationFiles.forEach(fileInput => {
        fileInput.addEventListener('change', function() {
            const button = this.nextElementSibling;
            if (button && this.files.length > 0) {
                button.textContent = this.files[0].name;
            } else if (button) {
                button.textContent = button.getAttribute('data-original-text') || 'Choose File';
            }
        });
    });
    
    modificationFileBtns.forEach(btn => {
        btn.setAttribute('data-original-text', btn.textContent);
    });
    
    const modificationsToggle = document.getElementById('modificationsToggle');
    const modificationsMenu = document.getElementById('modificationsMenu');
    
    if (modificationsToggle && modificationsMenu) {
        modificationsToggle.addEventListener('click', function() {
            const isExpanded = modificationsMenu.style.display !== 'none';
            
            if (isExpanded) {
                modificationsMenu.style.display = 'none';
                this.querySelector('i').classList.remove('fa-chevron-up');
                this.querySelector('i').classList.add('fa-chevron-down');
            } else {
                modificationsMenu.style.display = 'block';
                this.querySelector('i').classList.remove('fa-chevron-down');
                this.querySelector('i').classList.add('fa-chevron-up');
            }
        });

        modificationsMenu.style.display = 'none';
    }
});
