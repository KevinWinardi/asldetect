import Swal, { type SweetAlertResult } from "sweetalert2";

const buttonStyle = {
    confirm: 'w-24 m-4 p-2 text-white bg-blue-500 rounded cursor-pointer border border-b-4 border-b-black transition hover:translate-y-0.5 hover:border-b-transparent hover:opacity-75',
    cancel: 'w-24 p-2 text-blue-500 bg-transparent rounded cursor-pointer border border-b-4 border-b-black transition hover:translate-y-0.5 hover:border hover:border-b-blue-500 hover:opacity-75',
};

export class Dialog {
    static async showSuccess(message: string): Promise<SweetAlertResult<any>> {
        return await Swal.fire({
            title: 'Success',
            text: message,
            icon: 'success',
            showCloseButton: true,
            position: 'top-end',
            toast: true,
            showConfirmButton: false,
        });
    }

    static async showInformation(message: string): Promise<SweetAlertResult<any>> {
        return await Swal.fire({
            title: 'Information',
            text: message,
            icon: 'info',
            buttonsStyling: false,
            customClass: {
                confirmButton: buttonStyle.confirm,
            }
        });
    }

    static async showConfirmation(message: string): Promise<SweetAlertResult<any>> {
        return await Swal.fire({
            title: 'Confirmation',
            text: message,
            icon: 'question',
            confirmButtonText: 'Yes',
            showCancelButton: true,
            reverseButtons: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: buttonStyle.confirm,
                cancelButton: buttonStyle.cancel,
            }
        });
    }

    static async showWarning(message: string): Promise<SweetAlertResult<any>> {
        return await Swal.fire({
            title: 'Warning',
            text: message,
            icon: 'warning',
            buttonsStyling: false,
            customClass: {
                confirmButton: buttonStyle.confirm,
            }
        });
    }

    static showError(message: string): Promise<SweetAlertResult<any>> {
        return Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'w-24 m-4 p-2 text-white bg-blue-500 rounded cursor-pointer border border-b-4 border-b-black transition hover:translate-y-0.5 hover:border-b-transparent hover:opacity-75',
            }
        });
    }

    static showLoading(): Promise<SweetAlertResult<any>> {
        return Swal.fire({
            title: 'Loading...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            },
        });
    }

    static closeDialog(): void {
        return Swal.close();
    }

    static async showInput({
        title,
        input,
        inputLabel,
        inputPlaceholder,
        inputValidator
    }: {
        title: string,
        input: 'text',
        inputLabel: string,
        inputPlaceholder: string,
        inputValidator: (value: string) => string | undefined,
    }) {
        const { value: name } = await Swal.fire({
            title: title,
            input: input,
            inputLabel: inputLabel,
            inputPlaceholder: inputPlaceholder,
            showCancelButton: true,
            reverseButtons: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: buttonStyle.confirm,
                cancelButton: buttonStyle.cancel,
            },
            inputValidator: inputValidator,
        });
        return name;
    }
}