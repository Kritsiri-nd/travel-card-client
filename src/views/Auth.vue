<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../composables/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const AUTH_SERVER_BASE_URL =
    import.meta.env.VITE_AUTH_SERVER_BASE_URL ?? resolveAuthServerBase(API_BASE_URL);

const router = useRouter();
const { setToken, fetchCurrentUser } = useAuth();

const isSignUp = ref(false);

const loginForm = ref({ email: "", password: "" });
const registerForm = ref({ fullName: "", email: "", password: "", confirm: "", agree: false });

const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);

const loginError = ref<string | null>(null);
const registerError = ref<string | null>(null);
const loginLoading = ref(false);
const registerLoading = ref(false);

function resolveAuthServerBase(apiBase: string) {
    try {
        const url = new URL(apiBase, window.location.origin);
        const path = url.pathname.replace(/\/api\/?$/, "").replace(/\/$/, "");
        return `${url.origin}${path}`;
    } catch {
        return window.location.origin;
    }
}

const redirectToProvider = (provider: "google" | "line") => {
    window.location.href = `${AUTH_SERVER_BASE_URL}/oauth2/authorization/${provider}`;
};

const togglePanel = (value: boolean) => {
    isSignUp.value = value;
    loginError.value = null;
    registerError.value = null;
};

const handleLogin = async () => {
    if (!loginForm.value.email.trim() || !loginForm.value.password.trim()) {
        loginError.value = "กรุณากรอกอีเมลและรหัสผ่าน";
        return;
    }
    loginLoading.value = true;
    loginError.value = null;
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: loginForm.value.email.trim(),
                password: loginForm.value.password
            })
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(data?.message ?? "เข้าสู่ระบบไม่สำเร็จ");
        }
        if (!data?.token) {
            throw new Error("ไม่ได้รับโทเค็นจากระบบ");
        }
        setToken(data.token);
        await fetchCurrentUser();
        router.push({ name: "home" });
    } catch (err) {
        loginError.value = err instanceof Error ? err.message : "เกิดข้อผิดพลาด โปรดลองอีกครั้ง";
    } finally {
        loginLoading.value = false;
    }
};

const handleRegister = async () => {
    if (!registerForm.value.fullName.trim() || !registerForm.value.email.trim() || !registerForm.value.password.trim()) {
        registerError.value = "กรุณากรอกชื่อ อีเมล และรหัสผ่าน";
        return;
    }
    if (registerForm.value.password.length < 8) {
        registerError.value = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
        return;
    }
    if (registerForm.value.password !== registerForm.value.confirm) {
        registerError.value = "รหัสผ่านไม่ตรงกัน";
        return;
    }
    if (!registerForm.value.agree) {
        registerError.value = "กรุณายอมรับเงื่อนไขการใช้งาน";
        return;
    }

    registerLoading.value = true;
    registerError.value = null;
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                displayName: registerForm.value.fullName.trim(),
                email: registerForm.value.email.trim(),
                password: registerForm.value.password
            })
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(data?.message ?? "สมัครสมาชิกไม่สำเร็จ");
        }
        if (!data?.token) {
            throw new Error("ไม่ได้รับโทเค็นจากระบบ");
        }
        setToken(data.token);
        await fetchCurrentUser();
        router.push({ name: "home" });
    } catch (err) {
        registerError.value = err instanceof Error ? err.message : "เกิดข้อผิดพลาด โปรดลองอีกครั้ง";
    } finally {
        registerLoading.value = false;
    }
};
</script>

<template>
    <div class="page">
        <div class="card" :class="{ 'right-panel-active': isSignUp }">
            <div class="form-container sign-up-container">
                <form class="form" @submit.prevent="handleRegister">
                    <h1 class="title">สร้างบัญชีใหม่</h1>

                    <div class="social-row">
                        <button type="button" class="social-btn" @click="redirectToProvider('google')" aria-label="สมัครด้วย Google">
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                                    fill="#4285F4" />
                                <path
                                    d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
                                    fill="#34A853" />
                                <path
                                    d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
                                    fill="#FBBC05" />
                                <path
                                    d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                                    fill="#EA4335" />
                            </svg>
                        </button>
                        <button type="button" class="social-btn line" @click="redirectToProvider('line')" aria-label="สมัครด้วย LINE">
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path
                                    d="M22.4 10.8c0-5.2-5-9.5-10.8-9.5C5.4 1.3.8 5.6.8 10.8c0 4.7 4.2 8.6 9 9.4-.1.8-.3 1.7-.5 2.4-.1.4-.2.8-.3 1.1 0 .1-.1.2 0 .3 0 .2.2.3.4.2 1.8-1.1 5-3.2 6.8-5.5 3.8-.7 6.2-4.1 6.2-7.9z" />
                            </svg>
                        </button>
                    </div>

                    <span class="hint">หรือสมัครด้วยอีเมล</span>

                    <div class="field">
                        <input v-model="registerForm.fullName" type="text" placeholder="ชื่อ-นามสกุล" required />
                    </div>
                    <div class="field">
                        <input v-model="registerForm.email" type="email" placeholder="อีเมล" required />
                    </div>
                    <div class="field">
                        <input :type="showRegisterPassword ? 'text' : 'password'" v-model="registerForm.password"
                            placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)" required />
                        <button type="button" class="show-btn" @click="showRegisterPassword = !showRegisterPassword">
                            {{ showRegisterPassword ? "ซ่อน" : "แสดง" }}
                        </button>
                    </div>
                    <div class="field">
                        <input :type="showRegisterPassword ? 'text' : 'password'" v-model="registerForm.confirm"
                            placeholder="ยืนยันรหัสผ่าน" required />
                    </div>

                    <label class="agree">
                        <input v-model="registerForm.agree" type="checkbox" />
                        <span>ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</span>
                    </label>

                    <p v-if="registerError" class="error">{{ registerError }}</p>

                    <button class="main-btn" type="submit" :disabled="registerLoading">
                        {{ registerLoading ? "กำลังสมัคร..." : "สมัครสมาชิก" }}
                    </button>

                    <p class="swap mobile">
                        มีบัญชีอยู่แล้ว? <span @click="togglePanel(false)">เข้าสู่ระบบ</span>
                    </p>
                </form>
            </div>

            <div class="form-container sign-in-container">
                <form class="form" @submit.prevent="handleLogin">
                    <h1 class="title">เข้าสู่ระบบ</h1>

                    <div class="social-row">
                        <button type="button" class="social-btn" @click="redirectToProvider('google')"
                            aria-label="เข้าสู่ระบบด้วย Google">
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                                    fill="#4285F4" />
                                <path
                                    d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
                                    fill="#34A853" />
                                <path
                                    d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
                                    fill="#FBBC05" />
                                <path
                                    d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                                    fill="#EA4335" />
                            </svg>
                        </button>
                        <button type="button" class="social-btn line" @click="redirectToProvider('line')" aria-label="เข้าสู่ระบบด้วย LINE">
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path
                                    d="M22.4 10.8c0-5.2-5-9.5-10.8-9.5C5.4 1.3.8 5.6.8 10.8c0 4.7 4.2 8.6 9 9.4-.1.8-.3 1.7-.5 2.4-.1.4-.2.8-.3 1.1 0 .1-.1.2 0 .3 0 .2.2.3.4.2 1.8-1.1 5-3.2 6.8-5.5 3.8-.7 6.2-4.1 6.2-7.9z" />
                            </svg>
                        </button>
                    </div>

                    <span class="hint">หรือใช้บัญชีของคุณ</span>

                    <div class="field">
                        <input v-model="loginForm.email" type="email" placeholder="อีเมล" required />
                    </div>
                    <div class="field">
                        <input :type="showLoginPassword ? 'text' : 'password'" v-model="loginForm.password" placeholder="รหัสผ่าน"
                            required />
                        <button type="button" class="show-btn" @click="showLoginPassword = !showLoginPassword">
                            {{ showLoginPassword ? "ซ่อน" : "แสดง" }}
                        </button>
                    </div>

                    <p v-if="loginError" class="error">{{ loginError }}</p>

                    <button class="main-btn" type="submit" :disabled="loginLoading">
                        {{ loginLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ" }}
                    </button>

                    <p class="swap mobile">
                        ยังไม่มีบัญชี? <span @click="togglePanel(true)">สมัครสมาชิก</span>
                    </p>
                </form>
            </div>

            <div class="overlay-container desktop">
                <div class="overlay">
                    <div class="overlay-panel overlay-left">
                        <h2>ยินดีต้อนรับกลับ!</h2>
                        <p>หากมีบัญชีอยู่แล้ว เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
                        <button class="ghost-btn" @click="togglePanel(false)">หน้าเข้าสู่ระบบ</button>
                    </div>
                    <div class="overlay-panel overlay-right">
                        <h2>สวัสดีนักเดินทาง!</h2>
                        <p>กรอกข้อมูลของคุณแล้วเริ่มการเดินทางไปกับเรา</p>
                        <button class="ghost-btn" @click="togglePanel(true)">หน้าสมัครสมาชิก</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #e2e8f0, #f8fafc);
    padding: 2.5rem 1.25rem;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    overflow: hidden;
}

.card {
    position: relative;
    background: rgba(255, 255, 255, 0.88);
    border-radius: 28px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
    overflow: hidden;
    width: 100%;
    max-width: 1100px;
    min-height: 640px;
    transition: transform 0.6s ease-in-out;
}

.form-container {
    position: absolute;
    top: 0;
    height: 100%;
    transition: all 0.7s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

.sign-in-container {
    left: 0;
    width: 100%;
    z-index: 5;
    opacity: 1;
}

.sign-up-container {
    left: 0;
    width: 100%;
    opacity: 0;
    z-index: 1;
}

.card.right-panel-active .sign-in-container {
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;
}

.card.right-panel-active .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 6;
    animation: show 0.6s;
}

.overlay-container {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.7s ease-in-out;
    z-index: 3;
    pointer-events: none;
}

.card.right-panel-active .overlay-container {
    transform: translateX(-100%);
}

.overlay {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(37, 99, 235, 0.12));
    color: #fff;
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    transform: translateX(0);
    transition: transform 0.7s ease-in-out;
    background-image: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(26, 86, 219, 0.12)),
        url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2021&q=80");
    background-size: cover;
    background-position: center;
}

.card.right-panel-active .overlay {
    transform: translateX(50%);
}

.overlay-panel {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    top: 0;
    height: 100%;
    width: 50%;
    padding: 0 48px;
    transition: transform 0.7s ease-in-out;
    pointer-events: auto;
}

.overlay-left {
    transform: translateX(-20%);
}

.card.right-panel-active .overlay-left {
    transform: translateX(0);
}

.overlay-right {
    right: 0;
}

.card.right-panel-active .overlay-right {
    transform: translateX(20%);
}

.form {
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
    max-width: 520px;
    padding: 36px;
    gap: 14px;
}

.title {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 6px;
}

.social-row {
    display: flex;
    gap: 14px;
    margin: 12px 0;
}

.social-btn {
    height: 46px;
    width: 46px;
    border-radius: 999px;
    border: 1px solid rgba(226, 232, 240, 0.9);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.social-btn:hover {
    transform: translateY(-1px);
    border-color: #94a3b8;
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.1);
    background: #fff;
}

.social-btn.line {
    background: #06c755;
    color: #fff;
    border-color: transparent;
}

.hint {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 8px;
}

.field {
    width: 100%;
    position: relative;
    margin-top: 6px;
}

.field input {
    width: 100%;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    padding: 13px 12px;
    font-size: 14px;
    color: #0f172a;
    background: rgba(255, 255, 255, 0.82);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.field input:focus {
    outline: none;
    border-color: #06b6d4;
    box-shadow: 0 12px 32px rgba(6, 182, 212, 0.2);
    background: #fff;
}

.show-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 12px;
    color: #0ea5e9;
    cursor: pointer;
    padding: 4px 6px;
}

.agree {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: #475569;
    margin-top: 8px;
}

.agree input {
    margin-top: 3px;
}

.main-btn {
    border-radius: 999px;
    background: #06b6d4;
    color: #fff;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 14px 24px;
    width: 100%;
    border: none;
    cursor: pointer;
    margin-top: 6px;
    transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
    box-shadow: 0 10px 30px rgba(6, 182, 212, 0.25);
}

.main-btn:hover {
    transform: translateY(-1px);
    background: #0891b2;
}

.main-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.ghost-btn {
    border-radius: 999px;
    border: 2px solid #fff;
    background: transparent;
    color: #fff;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 12px 28px;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
}

.ghost-btn:hover {
    background: #fff;
    color: #0ea5e9;
    transform: translateY(-2px);
}

.error {
    color: #dc2626;
    font-size: 13px;
    margin-top: 6px;
}

.swap {
    margin-top: 10px;
    font-size: 13px;
    color: #475569;
}

.swap span {
    color: #0ea5e9;
    font-weight: 700;
    cursor: pointer;
}

.desktop {
    display: none;
}

.mobile {
    display: block;
}

@keyframes show {
    0%,
    49.99% {
        opacity: 0;
        z-index: 1;
    }
    50%,
    100% {
        opacity: 1;
        z-index: 5;
    }
}

@media (min-width: 768px) {
    .sign-in-container,
    .sign-up-container {
        width: 50%;
    }
    .card.right-panel-active .sign-in-container {
        transform: translateX(100%);
        opacity: 0;
    }
}

@media (min-width: 1024px) {
    .card {
        min-height: 620px;
    }
    .desktop {
        display: block;
    }
    .mobile {
        display: none;
    }
}
</style>
