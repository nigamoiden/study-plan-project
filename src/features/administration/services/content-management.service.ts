import { getContentManagementData } from "./admin.service";

export function getContentItems() {
  return getContentManagementData();
}
