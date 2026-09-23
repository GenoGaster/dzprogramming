using System;
namespace AngryBird;

public static class AngryBirdsTask
{
    static void Main()
    {   
        Console.Write("Введите скорость снаряда (м/с): ");
        double v = double.Parse(Console.ReadLine()!);
        Console.Write("Введите расстояние до цели (м): ");
        double distance = double.Parse(Console.ReadLine()!);

        double angle = FindSightAngle(v,distance);
        if (double.IsNaN(angle))
        {
            Console.WriteLine("Решения не существует");
        }
        else
        {
            Console.WriteLine($"Угол (в градусах): {angle}");
        }
    }
    public static double FindSightAngle(double v, double distance)
    {
        double g = 9.8;
        double argument = (distance * g) / (v*v);

        if (Math.Abs(argument) > 1.0)
        {
            return double.NaN;
        }

        return (Math.Asin(argument) * 0.5) * (180/Math.PI); //перевод в градусы
    }
}
