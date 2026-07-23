<?php

class App
{
    protected static array $config = [];

    public static function load(string $file): void
    {
        if (file_exists($file)) {
            static::$config = array_merge(static::$config, require $file);
        }
    }

    public static function config(string $key, mixed $default = null): mixed
    {
        return static::$config[$key] ?? $default;
    }
}
