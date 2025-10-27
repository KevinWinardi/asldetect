import Swal, { type SweetAlertResult } from "sweetalert2";

export class Dialog {
    static async showInformation(message: string): Promise<SweetAlertResult<any>> {
        return await Swal.fire({
            title: 'Information',
            text: message,
            icon: 'info',
        });
    }

    static async showConfirmation(message: string): Promise<SweetAlertResult<any>> {
        return await Swal.fire({
            title: 'Confirmation',
            text: message,
            icon: 'question',
            showCancelButton: true,
        });
    }

    static async showWarning(message: string): Promise<SweetAlertResult<any>> {
        return await Swal.fire({
            title: 'Warning',
            text: message,
            icon: 'warning',
        });
    }

    static showError(message: string): Promise<SweetAlertResult<any>> {
        return Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
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

    static hideLoading(): void {
        return Swal.close();
    }
}