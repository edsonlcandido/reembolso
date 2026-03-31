import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import CompanyForm from '../components/CompanyForm.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/companies/:id/edit', name: 'companies-edit', component: { template: '<div />' } },
  ],
})

function mountForm(companyStoreOverrides = {}) {
  return mount(CompanyForm, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            company: { loading: false, ...companyStoreOverrides },
          },
        }),
        router,
      ],
    },
  })
}

describe('CompanyForm.vue', () => {
  describe('renderização inicial', () => {
    it('exibe o título "Criar Empresa"', () => {
      const wrapper = mountForm()
      expect(wrapper.text()).toContain('Criar Empresa')
    })

    it('não exibe mensagem de erro ou sucesso ao montar', () => {
      const wrapper = mountForm()
      expect(wrapper.find('[class*="bg-red"]').exists()).toBe(false)
      expect(wrapper.find('[class*="bg-green"]').exists()).toBe(false)
    })

    it('exibe o campo de slug com preview da URL', () => {
      const wrapper = mountForm()
      expect(wrapper.text()).toContain('/app/companies/slug-da-empresa')
    })
  })

  describe('geração automática de slug', () => {
    it('gera slug a partir do nome da empresa', async () => {
      const wrapper = mountForm()
      const nameInput = wrapper.find('input[placeholder="Nome da empresa"]')
      await nameInput.setValue('Minha Empresa')
      await nameInput.trigger('input')
      const slugInput = wrapper.find<HTMLInputElement>('input[placeholder="slug-da-empresa"]')
      expect(slugInput.element.value).toBe('minha-empresa')
    })

    it('remove acentos ao gerar slug', async () => {
      const wrapper = mountForm()
      const nameInput = wrapper.find('input[placeholder="Nome da empresa"]')
      await nameInput.setValue('Empresa Açaí')
      await nameInput.trigger('input')
      const slugInput = wrapper.find<HTMLInputElement>('input[placeholder="slug-da-empresa"]')
      expect(slugInput.element.value).toBe('empresa-acai')
    })

    it('converte para minúsculas ao gerar slug', async () => {
      const wrapper = mountForm()
      const nameInput = wrapper.find('input[placeholder="Nome da empresa"]')
      await nameInput.setValue('EMPRESA TESTE')
      await nameInput.trigger('input')
      const slugInput = wrapper.find<HTMLInputElement>('input[placeholder="slug-da-empresa"]')
      expect(slugInput.element.value).toBe('empresa-teste')
    })

    it('não sobrescreve slug editado manualmente', async () => {
      const wrapper = mountForm()
      const slugInput = wrapper.find('input[placeholder="slug-da-empresa"]')
      await slugInput.setValue('meu-slug-custom')
      await slugInput.trigger('input')

      const nameInput = wrapper.find('input[placeholder="Nome da empresa"]')
      await nameInput.setValue('Outro Nome')
      await nameInput.trigger('input')

      expect((slugInput.element as HTMLInputElement).value).toBe('meu-slug-custom')
    })
  })

  describe('validação de slug', () => {
    it('exibe erro para slug com caracteres inválidos', async () => {
      const wrapper = mountForm()
      const slugInput = wrapper.find('input[placeholder="slug-da-empresa"]')
      await slugInput.setValue('Slug Inválido!')
      await slugInput.trigger('input')
      expect(wrapper.text()).toContain('letras minúsculas, números e hífens')
    })

    it('não chama createCompany ao submeter com slug inválido', async () => {
      const wrapper = mountForm()
      const { useCompanyStore } = await import('../stores/company')
      const companyStore = useCompanyStore()

      await wrapper.find('input[placeholder="Nome da empresa"]').setValue('Empresa X')
      await wrapper.find('input[placeholder="Nome da empresa"]').trigger('input')

      const slugInput = wrapper.find('input[placeholder="slug-da-empresa"]')
      await slugInput.setValue('Slug Inválido!')
      await slugInput.trigger('input')
      await wrapper.find('form').trigger('submit')

      expect(companyStore.createCompany).not.toHaveBeenCalled()
    })

    it('exibe erro para slug com menos de 3 caracteres', async () => {
      const wrapper = mountForm()
      const slugInput = wrapper.find('input[placeholder="slug-da-empresa"]')
      await slugInput.setValue('ab')
      await slugInput.trigger('input')
      expect(wrapper.text()).toContain('pelo menos 3 caracteres')
    })

    it('não exibe erro para slug válido', async () => {
      const wrapper = mountForm()
      const slugInput = wrapper.find('input[placeholder="slug-da-empresa"]')
      await slugInput.setValue('empresa-valida')
      await slugInput.trigger('input')
      expect(wrapper.text()).not.toContain('letras minúsculas, números e hífens')
      expect(wrapper.text()).not.toContain('pelo menos 3 caracteres')
    })

    it('exibe o link de acesso quando o slug é válido', async () => {
      const wrapper = mountForm()
      const nameInput = wrapper.find('input[placeholder="Nome da empresa"]')
      await nameInput.setValue('empresa teste')
      await nameInput.trigger('input')
      expect(wrapper.find('a[href="/app/companies/empresa-teste"]').exists()).toBe(true)
    })
  })

  describe('máscara de CNPJ', () => {
    async function triggerCnpjInput(wrapper: ReturnType<typeof mount>, value: string) {
      const input = wrapper.find<HTMLInputElement>('input[placeholder="XX.XXX.XXX/XXXX-XX"]')
      input.element.value = value
      await input.trigger('input')
      return input
    }

    it('formata CNPJ parcial com 6 dígitos', async () => {
      const wrapper = mountForm()
      const input = await triggerCnpjInput(wrapper, '123456')
      expect(input.element.value).toBe('12.345.6')
    })

    it('formata CNPJ parcial com 9 dígitos', async () => {
      const wrapper = mountForm()
      const input = await triggerCnpjInput(wrapper, '123456789')
      expect(input.element.value).toBe('12.345.678/9')
    })

    it('formata CNPJ completo com 14 dígitos', async () => {
      const wrapper = mountForm()
      const input = await triggerCnpjInput(wrapper, '12345678000195')
      expect(input.element.value).toBe('12.345.678/0001-95')
    })

    it('ignora caracteres não numéricos na máscara', async () => {
      const wrapper = mountForm()
      const input = await triggerCnpjInput(wrapper, '12.345.678/0001-95')
      expect(input.element.value).toBe('12.345.678/0001-95')
    })
  })

  describe('validação de e-mail', () => {
    it('exibe erro para e-mail em formato inválido ao submeter', async () => {
      const wrapper = mountForm()
      await wrapper.find('input[placeholder="Nome da empresa"]').setValue('Empresa Teste')
      await wrapper.find('input[placeholder="Nome da empresa"]').trigger('input')
      await wrapper.find('input[placeholder="empresa@email.com"]').setValue('invalido')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('Formato de e-mail inválido')
    })

    it('não exibe erro para e-mail válido', async () => {
      const wrapper = mountForm()
      await wrapper.find('input[placeholder="empresa@email.com"]').setValue('valido@empresa.com')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).not.toContain('Formato de e-mail inválido')
    })
  })

  describe('validações ao submeter', () => {
    it('exibe erro ao submeter sem nome da empresa', async () => {
      const wrapper = mountForm()
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('O nome da empresa é obrigatório')
    })

    it('exibe erro ao submeter sem slug', async () => {
      const wrapper = mountForm()
      const nameInput = wrapper.find('input[placeholder="Nome da empresa"]')
      await nameInput.setValue('Empresa X')
      // Apaga o slug auto-gerado
      const slugInput = wrapper.find('input[placeholder="slug-da-empresa"]')
      await slugInput.setValue('')
      await slugInput.trigger('input')
      // Precisamos forçar o formulário a ter slug vazio
      // Re-setamos form diretamente via component vm
      ;(wrapper.vm as any).form.slug = ''
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('O slug é obrigatório')
    })

    it('chama createCompany da store ao submeter formulário válido', async () => {
      const wrapper = mountForm()
      const { useCompanyStore } = await import('../stores/company')
      const companyStore = useCompanyStore()
      ;(companyStore.createCompany as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, companyId: '123' })

      await wrapper.find('input[placeholder="Nome da empresa"]').setValue('Empresa Válida')
      await wrapper.find('input[placeholder="Nome da empresa"]').trigger('input')
      await wrapper.find('form').trigger('submit')

      expect(companyStore.createCompany).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Empresa Válida' })
      )
    })

    it('exibe mensagem de erro retornada pela store', async () => {
      const wrapper = mountForm()
      const { useCompanyStore } = await import('../stores/company')
      const companyStore = useCompanyStore()
      ;(companyStore.createCompany as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Slug já em uso.',
      })

      await wrapper.find('input[placeholder="Nome da empresa"]').setValue('Empresa Y')
      await wrapper.find('input[placeholder="Nome da empresa"]').trigger('input')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.text()).toContain('Slug já em uso.')
    })
  })

  describe('estado de carregamento', () => {
    it('desabilita o botão de submit quando a store está carregando', () => {
      const wrapper = mountForm({ loading: true })
      const btn = wrapper.find('button[type="submit"]')
      expect((btn.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('exibe "Salvando..." quando a store está carregando', () => {
      const wrapper = mountForm({ loading: true })
      expect(wrapper.text()).toContain('Salvando...')
    })

    it('exibe "Criar Empresa" quando não está carregando', () => {
      const wrapper = mountForm({ loading: false })
      expect(wrapper.find('button[type="submit"]').text()).toContain('Criar Empresa')
    })
  })
})
