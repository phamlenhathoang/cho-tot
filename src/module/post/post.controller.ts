import { Body, Controller, Delete, Get, Post, Put, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../auth/config/multer.config';
import { PostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards/jwt-auth.guards.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { PaginationDTO } from 'src/common/pagination';


@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
      },

      content: {
        type: 'string',
      },

      categoryId: {
        type: 'number',
      },

      price: {
        type: 'number',
      },

      weight: {
        type: 'number',
      },

      length: {
        type: 'number',
      },

      width: {
        type: 'number',
      },

      height: {
        type: 'number',
      },

      files: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
      },
    },

    required: [
      'title',
      'content',
      'categoryId',
      'price',
      'weight',
      'length',
      'width',
      'height',
    ],
  },
})
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
    @Body() postDto: PostDto,
  ) {
    
    // let imageUrls;
    // if (files && files.length > 0) {
    //   const baseUrl = `${req.protocol}://${req.get('host')}`;

    //   imageUrls = files.map(file => {
    //     return `${baseUrl}/uploads/${file.filename}`;
    //   });
    // }
    return await this.postService.createPost(
      postDto,
      files,
      req.user
    );
  }

  // @Put('update')
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       title: {
  //         type: 'string',
  //       },

  //       content: {
  //         type: 'string',
  //       },

  //       authorId: {
  //         type: 'number',
  //       },

  //       categoryId: {
  //         type: 'number',
  //       },

  //       imageIds: {
  //         type: 'array',
  //         items: {
  //           type: 'string',
  //         },
  //       },

  //       files: {
  //         type: 'array',
  //         items: {
  //           type: 'string',
  //           format: 'binary',
  //         },
  //       },
  //     },

  //     required: [
  //       'authorId',
  //     ],
  //   },
  // })
  // @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  // async updatePost(
  //   @Query('id') id: number,
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @Req() req: any,
  //   @Body() updatePostDto: UpdatePostDto,
  // ) {
  //   const baseUrl = `${req.protocol}://${req.get('host')}`;

  //   let imageUrls: string [] = [];
  //   if(files && files.length > 0){
  //     imageUrls = files.map(files => {
  //       return '${baseUrl}/uploads/${file.filename}'
  //     });
  //   }

  //   const imageIds = updatePostDto.imageIds || [];

  //   let updateImages:{
  //     imageId: number;
  //     url: string;
  //   }[] = [];

  //   let newImageUrl: string [] = [];

  //   if(imageIds.length > 0){
  //     updateImages = imageIds.map((id, index) => ({
  //       imageId: Number(id),
  //       url: imageUrls[index],
  //     }));
  //     newImageUrl: imageUrls.slice(imageIds.length);
  //   }else{
  //     newImageUrl = imageUrls
  //   }

  //   return await this.postService.updatePost(id, updatePostDto, updateImages, newImageUrl);

  // }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Put('update')
  async updatePost(@Query('id') id: number, @Body() updatePostDto: UpdatePostDto, @Req() rq) {
    return this.postService.updatePost(id, updatePostDto, rq.user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Delete('delete')
  async deletePost(@Query('id') id: number, @Req() req) {
    return this.postService.deletePost(id, req.user.id);
  }


  @ApiBearerAuth('access-token')
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('get-all-posts-of-userid')
  async getAllPostsByUserId(@Req() rq, @Query('isPublic') isPublic: number) {
    let check: boolean | null = null;
    if (isPublic == 1) {
      check = true;
    }

    if (isPublic == 0) {
      check = false;
    }

    if (isPublic == 2) {
      check = null;
    }

    return this.postService.getAllPostsByUserId(rq.user.id, check);
  }

  // @ApiBearerAuth('access-token')
  // @Roles(Role.CUSTOMER)
  // @UseGuards(JwtAuthGuard, RolesGuard)

  @Get('get-by-userid')
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
  })

  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.ADMIN)
  async getPostByUserId(@Req() rq, @Query('title') title: string, @Query() paginatioDto: PaginationDTO) {
    return this.postService.getPostsByUserId(rq.user, title, paginatioDto);
  }

  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.CUSTOMER)
  @Get('id')
  async getPostById(@Query('id') id: number) {
    return this.postService.getPostById(id);
  }

  @Get('all')
  async getAllPost() {
    return this.postService.getAllPost();
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('get-all-post-by-user-id')
  async getAllPostByUserId(@Query('id') userId: number) {
    return this.postService.getAllPostByUserId(userId);
  }
}
