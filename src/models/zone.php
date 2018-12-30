<?php

class Zone extends \Illuminate\Database\Eloquent\Model
{
    protected $table = "zone";
    public $timestamps = false;
    protected $fillable = ['geom'];
}