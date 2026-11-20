import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from '../ContactForm';

describe('ContactForm', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('registra en consola los datos del formulario al enviar con datos válidos (#150)', () => {
    render(<ContactForm />);

    const inputNombre = screen.getByLabelText(/nombre completo/i);
    const inputEmail = screen.getByLabelText(/correo electrónico/i);
    const inputTelefono = screen.getByLabelText(/teléfono/i);
    const selectMotivo = screen.getByLabelText(/motivo de consulta/i);
    const inputMensaje = screen.getByLabelText(/mensaje/i);
    const botonEnviar = screen.getByRole('button', { name: /enviar mensaje/i });

    fireEvent.change(inputNombre, { target: { value: 'Agustín Leiva' } });
    fireEvent.change(inputEmail, { target: { value: 'agustin@example.com' } });
    fireEvent.change(inputTelefono, { target: { value: '+54 11 1234-5678' } });
    fireEvent.change(selectMotivo, { target: { value: 'consulta' } });
    fireEvent.change(inputMensaje, { target: { value: 'Hola, me gustaría consultar por disponibilidad de mesas.' } });

    fireEvent.click(botonEnviar);

    expect(console.log).toHaveBeenCalledWith({
      nombre: 'Agustín Leiva',
      email: 'agustin@example.com',
      telefono: '+54 11 1234-5678',
      motivo: 'consulta',
      mensaje: 'Hola, me gustaría consultar por disponibilidad de mesas.'
    });

    expect(screen.getByText(/¡mensaje enviado!/i)).toBeInTheDocument();
  });
});
