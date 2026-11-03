export type CoachFreeAccount = {
  id: string;
  fullName: string;
  email: string;
  countryCode: string;
  accessCode: string;
  createdAt: string;
  passwordHash: string;
};

const globalStore = globalThis as typeof globalThis & {
  __synqCoachFreeAccounts?: CoachFreeAccount[];
};

function bucket(): CoachFreeAccount[] {
  if (!globalStore.__synqCoachFreeAccounts) globalStore.__synqCoachFreeAccounts = [];
  return globalStore.__synqCoachFreeAccounts;
}

export function listCoachFreeAccounts(): CoachFreeAccount[] {
  return bucket()
    .map((account) => ({ ...account }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findCoachFreeByEmail(email: string): CoachFreeAccount | undefined {
  const key = email.trim().toLowerCase();
  const found = bucket().find((account) => account.email === key);
  return found ? { ...found } : undefined;
}

export function findCoachFreeById(id: string): CoachFreeAccount | undefined {
  const found = bucket().find((account) => account.id === id);
  return found ? { ...found } : undefined;
}

export function insertCoachFreeAccount(account: CoachFreeAccount): CoachFreeAccount {
  globalStore.__synqCoachFreeAccounts = [account, ...bucket().filter((item) => item.id !== account.id)];
  return { ...account };
}
