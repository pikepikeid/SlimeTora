class Onboarding {
    private steps: HTMLElement[];
    private currentStepIndex: number;
    private config: typeof onboardingConfig;

    constructor(config: typeof onboardingConfig) {
        this.config = config;
        this.steps = config.steps.map((step) => {
            const element = document.getElementById(step.id) as HTMLElement;
            if (!element) {
                window.error(`Element with ID ${step.id} not found`);
            }
            return element;
        });
        this.currentStepIndex = 0;
        window.log(`Initial step index: ${this.currentStepIndex}`);
        this.showStep(this.currentStepIndex);
        this.addEventListeners();
    }

    private showStep(index: number): void {
        window.log(`Showing step index: ${index}`);
        this.steps.forEach((step, i) => {
            if (i === index) {
                window.log(`Displaying element with ID: ${step.id}`);
                step.style.display = "flex";
            } else {
                step.style.display = "none";
            }
        });
        // Ensure the current step is visible
        const currentStep = this.steps[index];
        if (currentStep && currentStep.style.display !== "flex") {
            window.log(`Step ${currentStep.id} is not visible, forcing display`);
            currentStep.style.display = "flex";
        }
    }

    private goToStep(stepId: string): void {
        const stepIndex = this.config.steps.findIndex((step) => step.id === stepId);
        if (stepIndex !== -1) {
            this.currentStepIndex = stepIndex;
            this.showStep(this.currentStepIndex);
        } else {
            window.error(`Step with ID ${stepId} not found`);
        }
    }

    private addEventListeners(): void {
        this.config.steps.forEach((step) => {
            Object.entries(step.buttons).forEach(([buttonId, targetStepId]) => {
                const button = document.getElementById(buttonId);
                if (button) {
                    button.addEventListener("click", async () => {
                        window.log(`Button with ID ${buttonId} clicked`);
                        if (targetStepId === "finish") {
                            window.log("Onboarding process complete");
                            await showMessageBox(
                                "dialogs.onboarding.complete.title",
                                "dialogs.onboarding.complete.message",
                                true,
                                true,
                                true
                            );
                            window.open("https://github.com/OCSYT/SlimeTora/wiki/", "_blank");
                            window.close();
                        } else {
                            this.goToStep(targetStepId);
                        }
                    });
                } else {
                    window.error(`Button with ID ${buttonId} not found`);
                }
            });
        });
    }
}

const onboardingConfig = {
    steps: [
        {
            id: "step-1",
            buttons: {
                "step1-button": "step-2",
                "skip-button": "finish",
            },
        },
        {
            id: "step-2",
            buttons: {
                "next-step2-button": "step-3",
                "back-step2-button": "step-1",
            },
        },
        {
            id: "step-3",
            buttons: {
                "next-step3-button": "step-4",
                "back-step3-button": "step-2",
            },
        },
        {
            id: "step-4",
            buttons: {
                "next-step4-button": "step-5",
                "back-step4-button": "step-3",
            },
        },
        {
            id: "step-5",
            buttons: {
                "next-step5-button": "step-6",
                "back-step5-button": "step-4",
            },
        },
        {
            id: "step-6",
            buttons: {
                "next-step6-button": "step-7",
                "back-step6-button": "step-5",
            },
        },
        {
            id: "step-7",
            buttons: {
                "next-step7-button": "step-8",
                "back-step7-button": "step-6",
            },
        },
        {
            id: "step-8",
            buttons: {
                "next-step8-button": "step-9",
                "back-step8-button": "step-7",
            },
        },
        {
            id: "step-9",
            buttons: {
                "next-step9-button": "step-10",
                "back-step9-button": "step-8",
            },
        },
        {
            id: "step-10",
            buttons: {
                "next-step10-button": "finish",
                "back-step10-button": "step-9",
            },
        },
    ],
};

// Initialize the onboarding process
document.addEventListener("DOMContentLoaded", async () => {
    function appendOptions(selectElement: HTMLElement, options: string[]) {
        const fragment = document.createDocumentFragment();
        options.forEach((optionValue) => {
            const option = document.createElement("option");
            option.value = optionValue;
            option.text = optionValue;
            fragment.appendChild(option);
        });
        selectElement.appendChild(fragment);
    }

    new Onboarding(onboardingConfig);

    addEventListeners();

    // Populate language select
    const languageSelect = document.getElementById("language-select") as HTMLSelectElement;
    const languages: string[] = await window.ipc.invoke("get-languages", null);
    appendOptions(languageSelect, languages);
});

function addEventListeners() {
    document.getElementById("language-select").addEventListener("change", async function () {
        const language: string = (document.getElementById("language-select") as HTMLSelectElement).value;
        localStorage.setItem("language", language);
    });
}

window.addEventListener("storage", (event) => {
    window.log(`Storage event: "${event.key}" changed to "${event.newValue}"`);

    if (event.key === "status") {
        const step5 = document.getElementById("step-5");
        const statusElement = document.getElementById("status");

        if (step5?.style.display === "flex" && statusElement) {
            statusElement.textContent = event.newValue;
        }
    } else if (event.key === "trackerCount") {
        const step5 = document.getElementById("step-5");
        const connectedTrackersElement = document.getElementById("tracker-count");

        if (step5?.style.display === "flex" && connectedTrackersElement) {
            connectedTrackersElement.textContent = event.newValue;
        }
    } else if (event.key === "toggleConnectionButtons") {
        document.getElementById("start-connection-button").toggleAttribute("disabled");
        document.getElementById("stop-connection-button").toggleAttribute("disabled");
    }
});

async function showMessageBox(
    titleKey: string,
    messageKey: string,
    blocking: boolean = false,
    translateTitle: boolean = true,
    translateMessage: boolean = true
) {
    return await window.ipc.invoke("show-message", {
        title: titleKey,
        message: messageKey,
        blocking,
        translateTitle,
        translateMessage,
    });
}

// i can't believe this works lol
// Sets a flag in localStorage to start the auto-detection process found in the main window (which listens for this flag)
function startAutoDetection() {
    localStorage.setItem("autodetect", "true");
}

function runStartConnection() {
    localStorage.setItem("startConnection", "true");
}

function runStopConnection() {
    localStorage.setItem("stopConnection", "true");
}

window.autodetect = startAutoDetection;
window.runStartConnection = runStartConnection;
window.runStopConnection = runStopConnection;

export {};
