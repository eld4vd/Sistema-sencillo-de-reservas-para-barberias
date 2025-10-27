import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsStartBeforeEnd', async: false })
export class IsStartBeforeEndConstraint
  implements ValidatorConstraintInterface
{
  validate(_: unknown, args: ValidationArguments): boolean {
    const payload = args.object as Partial<{
      horarioInicio: string;
      horarioFin: string;
    }>;
    const start = payload?.horarioInicio;
    const end = payload?.horarioFin;
    if (!start || !end) return true; // Solo valida cuando ambos existen

    const toSec = (t: string): number => {
      const [h, m, s = '0'] = t.split(':');
      const hh = Number(h);
      const mm = Number(m);
      const ss = Number(s);
      if (Number.isNaN(hh) || Number.isNaN(mm) || Number.isNaN(ss)) return NaN;
      return hh * 3600 + mm * 60 + ss;
    };

    const a = toSec(start);
    const b = toSec(end);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    return a < b;
  }

  defaultMessage(_: ValidationArguments): string {
    return 'horarioInicio debe ser menor que horarioFin';
  }
}
