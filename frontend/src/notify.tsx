import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

export const notifyOk = (message: string) =>
    notifications.show({ message, color: 'teal', icon: <IconCheck size={16} />, autoClose: 3500 });

export const notifyError = (message: string) =>
    notifications.show({ title: 'Hiba', message, color: 'red', icon: <IconX size={16} />, autoClose: 7000 });
