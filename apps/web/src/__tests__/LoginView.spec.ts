import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
  ],
})

function mountLogin(authStoreOverrides = {}) {
  return mount(LoginView, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            auth: { user: null, token: '', ...authStoreOverrides },
          },
        }),
        router,
      ],
    },
  })
}

describe('LoginView.vue', () => {
  describe('renderização inicial (modo login)', () => {
    it('exibe o título "Bem-vindo de volta"', () => {
      const wrapper = mountLogin()
      expect(wrapper.text()).toContain('Bem-vindo de volta')
    })

    it('exibe o subtítulo correto no modo login', () => {
      const wrapper = mountLogin()
      expect(wrapper.text()).toContain('Entre com suas credenciais para continuar')
    })

    it('exibe os campos de e-mail e senha', () => {
      const wrapper = mountLogin()
      expect(wrapper.find('#email').exists()).toBe(true)
      expect(wrapper.find('#password').exists()).toBe(true)
    })

    it('não exibe o campo de nome no modo login', () => {
      const wrapper = mountLogin()
      expect(wrapper.find('#name').exists()).toBe(false)
    })

    it('exibe o botão "Criar Nova Conta"', () => {
      const wrapper = mountLogin()
      expect(wrapper.text()).toContain('Criar Nova Conta')
    })
  })

  describe('alternância de modo', () => {
    it('alterna para o modo registro ao clicar em "Criar Nova Conta"', async () => {
      const wrapper = mountLogin()
      const toggleBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Criar Nova Conta')
      )
      await toggleBtn!.trigger('click')
      expect(wrapper.text()).toContain('Criar conta')
      expect(wrapper.find('#name').exists()).toBe(true)
    })

    it('exibe campos de confirmação de senha no modo registro', async () => {
      const wrapper = mountLogin()
      const toggleBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Criar Nova Conta')
      )
      await toggleBtn!.trigger('click')
      expect(wrapper.find('#passwordConfirm').exists()).toBe(true)
    })

    it('volta para o modo login ao clicar em "Fazer Login" no modo registro', async () => {
      const wrapper = mountLogin()
      // Vai para registro
      const toRegisterBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Criar Nova Conta')
      )
      await toRegisterBtn!.trigger('click')
      // Volta para login
      const toLoginBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Fazer Login')
      )
      await toLoginBtn!.trigger('click')
      expect(wrapper.text()).toContain('Bem-vindo de volta')
    })

    it('alterna para o modo "esqueci a senha" ao clicar no link', async () => {
      const wrapper = mountLogin()
      // O botão "Esqueceu sua senha?" só aparece no modo login
      const forgotBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Esqueceu')
      )
      await forgotBtn!.trigger('click')
      expect(wrapper.text()).toContain('Recuperar senha')
    })

    it('limpa erros ao trocar de modo', async () => {
      const wrapper = mountLogin()
      // Força um erro via submissão com dados inválidos
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('Informe seu e-mail')

      // Alterna para registro — limpa o erro
      const toggleBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Criar Nova Conta')
      )
      await toggleBtn!.trigger('click')
      expect(wrapper.text()).not.toContain('Informe seu e-mail')
    })
  })

  describe('textos computados por modo', () => {
    it('exibe pergunta "Não tem uma conta?" no modo login', () => {
      const wrapper = mountLogin()
      expect(wrapper.text()).toContain('Nao tem uma conta?')
    })

    it('exibe pergunta "Já tem uma conta?" no modo registro', async () => {
      const wrapper = mountLogin()
      const toggleBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Criar Nova Conta')
      )
      await toggleBtn!.trigger('click')
      expect(wrapper.text()).toContain('Ja tem uma conta?')
    })

    it('exibe botão "Entrar" no modo login', () => {
      const wrapper = mountLogin()
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.text()).toContain('Entrar')
    })

    it('exibe botão "Criar conta" no modo registro', async () => {
      const wrapper = mountLogin()
      const toggleBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Criar Nova Conta')
      )
      await toggleBtn!.trigger('click')
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.text()).toContain('Criar conta')
    })
  })

  describe('validação do formulário de login', () => {
    it('exibe erro ao submeter sem e-mail', async () => {
      const wrapper = mountLogin()
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('Informe seu e-mail')
    })

    it('exibe erro para e-mail em formato inválido', async () => {
      const wrapper = mountLogin()
      await wrapper.find('#email').setValue('nao-eh-email')
      await wrapper.find('#password').setValue('senhavalida')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('E-mail invalido')
    })

    it('exibe erro ao submeter sem senha', async () => {
      const wrapper = mountLogin()
      await wrapper.find('#email').setValue('usuario@teste.com')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('Informe sua senha')
    })

    it('exibe erro quando a senha tem menos de 8 caracteres', async () => {
      const wrapper = mountLogin()
      await wrapper.find('#email').setValue('usuario@teste.com')
      await wrapper.find('#password').setValue('123')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('pelo menos 8 caracteres')
    })
  })

  describe('validação do formulário de registro', () => {
    async function goToRegister(wrapper: ReturnType<typeof mountLogin>) {
      const toggleBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Criar Nova Conta')
      )
      await toggleBtn!.trigger('click')
    }

    it('exibe erro ao submeter sem nome no modo registro', async () => {
      const wrapper = mountLogin()
      await goToRegister(wrapper)
      await wrapper.find('#email').setValue('user@teste.com')
      await wrapper.find('#password').setValue('senhaforte1')
      await wrapper.find('#passwordConfirm').setValue('senhaforte1')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('Informe seu nome')
    })

    it('exibe erro quando as senhas não coincidem no registro', async () => {
      const wrapper = mountLogin()
      await goToRegister(wrapper)
      await wrapper.find('#name').setValue('João Silva')
      await wrapper.find('#email').setValue('user@teste.com')
      await wrapper.find('#password').setValue('senhaforte1')
      await wrapper.find('#passwordConfirm').setValue('senhadiferente')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('As senhas nao coincidem')
    })
  })

  describe('chamadas à auth store', () => {
    it('chama authStore.login com as credenciais corretas', async () => {
      const wrapper = mountLogin()
      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()
      ;(authStore.login as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, error: 'Erro' })

      await wrapper.find('#email').setValue('user@teste.com')
      await wrapper.find('#password').setValue('senhavalida1')
      await wrapper.find('form').trigger('submit')

      expect(authStore.login).toHaveBeenCalledWith('user@teste.com', 'senhavalida1')
    })

    it('exibe mensagem de erro retornada pela store no login', async () => {
      const wrapper = mountLogin()
      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()
      ;(authStore.login as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'E-mail ou senha incorretos.',
      })

      await wrapper.find('#email').setValue('user@teste.com')
      await wrapper.find('#password').setValue('senhavalida1')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.text()).toContain('E-mail ou senha incorretos.')
    })

    it('chama authStore.requestPasswordReset ao submeter o formulário de esqueci a senha', async () => {
      const wrapper = mountLogin()
      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()
      ;(authStore.requestPasswordReset as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true })

      // Vai para modo "forgot"
      const forgotBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Esqueceu')
      )
      await forgotBtn!.trigger('click')

      await wrapper.find('#forgot-email').setValue('user@teste.com')
      await wrapper.find('form').trigger('submit')

      expect(authStore.requestPasswordReset).toHaveBeenCalledWith('user@teste.com')
    })

    it('exibe mensagem de sucesso após recuperação de senha', async () => {
      const wrapper = mountLogin()
      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()
      ;(authStore.requestPasswordReset as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true })

      const forgotBtn = wrapper.findAll('button[type="button"]').find(b =>
        b.text().includes('Esqueceu')
      )
      await forgotBtn!.trigger('click')
      await wrapper.find('#forgot-email').setValue('user@teste.com')
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('voce recebera um link')
    })
  })

  describe('estado de carregamento', () => {
    it('desabilita o botão de submit durante o carregamento', async () => {
      const wrapper = mountLogin()
      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()

      let resolveLogin!: (v: any) => void
      ;(authStore.login as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(res => { resolveLogin = res })
      )

      await wrapper.find('#email').setValue('user@teste.com')
      await wrapper.find('#password').setValue('senhavalida1')
      wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      expect((wrapper.find('button[type="submit"]').element as HTMLButtonElement).disabled).toBe(true)
      resolveLogin({ success: false, error: 'Erro' })
    })
  })
})
